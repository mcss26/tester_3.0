// supabase/functions/generate-member-qr/index.ts

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { verify } from "https://deno.land/x/djwt@v3.0.1/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const JWT_SECRET = Deno.env.get("MEMBER_JWT_SECRET") || "change-this-in-production";
const MCO_BATCH_ID = Deno.env.get("MCO_BATCH_ID");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Validar JWT del member
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return jsonResponse({ error: "No autorizado" }, 401);
    }

    const token = authHeader.replace("Bearer ", "");
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(JWT_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    let payload: { sub: string; member_id: string; nombre: string };
    try {
      // @ts-ignore: djwt types quirks
      payload = await verify(token, key);
    } catch {
      return jsonResponse({ error: "Token inválido o expirado" }, 401);
    }

    // 2. Verificar que el member está activo
    const { data: member, error: memberError } = await supabase
      .from("members")
      .select("id, member_id, nombre, status")
      .eq("id", payload.sub)
      .single();

    if (memberError || !member) {
      return jsonResponse({ error: "Member no encontrado" }, 404);
    }

    if (member.status !== "activo") {
      return jsonResponse({ error: "Tu membresía no está activa" }, 403);
    }

    // 3. Verificar jornada abierta
    const { data: workDay } = await supabase
      .from("work_days")
      .select("id, work_date")
      .eq("status", "open")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!workDay) {
      return jsonResponse({ error: "No hay evento activo esta noche" }, 400);
    }

    // 4. Calcular fecha de la noche operativa
    // Una "noche" va desde las 21:00 del día X hasta las 06:00 del día X+1
    const now = new Date();
    // Argentina is UTC-3. We want the "Operational Date".
    const argentinaOffset = -3 * 60; // UTC-3
    const localNow = new Date(now.getTime() + argentinaOffset * 60 * 1000);
    
    let nightDate = new Date(localNow);
    if (localNow.getHours() < 6) {
      // Si es antes de las 6AM, la noche pertenece al día anterior
      nightDate.setDate(nightDate.getDate() - 1);
    }
    nightDate.setHours(0, 0, 0, 0);
    
    // Define night range for query (UTC)
    // Night starts roughly at 21:00 Local (00:00 UTC next day)
    // Let's use a wide window based on Operational Date to be safe.
    // If Operational Date is Fri 31, Night starts Fri 31 21:00.
    // We check if a QR exists created "After 12:00 PM of Operational Date"
    const checkStart = new Date(nightDate);
    checkStart.setHours(12, 0, 0, 0); // 12:00 PM local
    // Convert back to UTC for DB Query
    const checkStartUTC = new Date(checkStart.getTime() - argentinaOffset * 60 * 1000);

    // Valid Until: 05:00 AM Local of next day (02:00 AM wait... request sid 'valid until 2am'). 
    // Request said "valid until 2AM".
    // If Night Date is Fri 31.
    // Next Day is Sat 01.
    // 02:00 AM Sat 01 Local = 05:00 AM Sat 01 UTC.
    const validUntilLocal = new Date(nightDate);
    validUntilLocal.setDate(validUntilLocal.getDate() + 1);
    validUntilLocal.setHours(2, 0, 0, 0); // 02:00 AM local
    const validUntilUTC = new Date(validUntilLocal.getTime() - argentinaOffset * 60 * 1000);

    // 5. Verificar si ya tiene QR para esta noche
    const { data: existingQr } = await supabase
      .from("qr_codes")
      .select("code, valid_until, status")
      .eq("member_id", member.id)
      .gte("created_at", checkStartUTC.toISOString())
      .maybeSingle();

    if (existingQr) {
      return jsonResponse({
        error: "Ya generaste tu QR para esta noche",
        existing_code: existingQr.code,
        valid_until: existingQr.valid_until,
        status: existingQr.status
      }, 409);
    }

    // 6. Generar código único
    const dateStr = nightDate.toISOString().split("T")[0].replace(/-/g, "");
    const randomPart = generateRandomCode(6);
    const qrCode = `MCO-${dateStr}-${randomPart}`;

    if (!MCO_BATCH_ID) {
         console.error("MCO_BATCH_ID not set");
         // Fallback or error? Error is safer.
         return jsonResponse({ error: "Configuration Error: Missing Batch ID" }, 500);
    }

    // 7. Insertar QR
    const { data: newQr, error: insertError } = await supabase
      .from("qr_codes")
      .insert({
        batch_id: MCO_BATCH_ID,
        code: qrCode,
        status: "ACTIVO",
        member_id: member.id,
        external_id: member.member_id,
        work_day_id: workDay.id,
        valid_until: validUntilUTC.toISOString()
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error inserting QR:", insertError);
      return jsonResponse({ error: "Error al generar QR" }, 500);
    }

    return jsonResponse({
      success: true,
      qr_code: qrCode,
      valid_until: validUntilUTC.toISOString(),
      member_name: member.nombre,
      work_date: workDay.work_date
    });

  } catch (err) {
    console.error("Error:", err);
    return jsonResponse({ error: "Error interno del servidor" }, 500);
  }
});

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function generateRandomCode(length: number): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  for (const byte of array) {
    result += chars[byte % chars.length];
  }
  return result;
}

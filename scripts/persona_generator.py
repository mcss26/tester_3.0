#!/usr/bin/env python3
"""
Data-Driven Persona Generator — FormulaMid 4
Creates research-backed user personas from user data and interviews.
Adapted for the nightclub ERP/CRM domain.

Usage:
    python scripts/persona_generator.py           # Formatted output (all personas)
    python scripts/persona_generator.py json       # JSON output
    python scripts/persona_generator.py admin      # Single persona by role
    python scripts/persona_generator.py operativo json  # Single persona as JSON
"""

import json
import sys
from typing import Dict, List, Optional
from collections import Counter, defaultdict


# ═══════════════════════════════════════════════════════════════
# DOMAIN-SPECIFIC DATA — FormulaMid 4 (Nightclub ERP/CRM)
# ═══════════════════════════════════════════════════════════════

DOMAIN_PERSONAS = {
    "admin": {
        "name": "Lucio «El Admin»",
        "role": "Administrador",
        "archetype": "business_user",
        "tagline": "Planifica la semana, cierra balances, controla P&L",
        "demographics": {
            "age_range": "28-40",
            "location_type": "Urbano — Buenos Aires",
            "occupation_category": "Dueño / Socio operativo",
            "education_level": "Universitario (Administración / Ingeniería)",
            "tech_proficiency": "Avanzado"
        },
        "psychographics": {
            "motivations": [
                "Control total del negocio",
                "Reducir errores operativos",
                "Maximizar rentabilidad por noche"
            ],
            "values": [
                "Precisión financiera",
                "Eficiencia operativa",
                "Datos sobre intuición"
            ],
            "attitudes": [
                "Exigente con los tiempos",
                "Orientado a métricas",
                "Prefiere dashboards sobre reportes largos"
            ],
            "lifestyle": "Nocturno, alta presión, multitasking constante"
        },
        "behaviors": {
            "usage_patterns": [
                "Diario: revisa KPIs y estado de jornadas",
                "Semanal: cierra balance, concilia con Zoco",
                "Mensual: analiza rentabilidad por categoría"
            ],
            "feature_preferences": [
                "admin-workdays (Night Chief + Cierre)",
                "admin-semanal (Balance consolidado)",
                "admin-central-stock (Rentabilidad SKU)",
                "admin-reportes (Exportación de datos)",
                "admin-solicitudes (Aprobación de compras)"
            ],
            "interaction_style": "Power user — usa atajos, espera respuesta < 2s",
            "learning_preference": "Aprende explorando, no lee manuales"
        },
        "needs_and_goals": {
            "primary_goals": [
                "Cerrar la noche en < 5 minutos",
                "Detectar descalces Zoco vs sistema al instante",
                "Ver P&L semanal sin clicks innecesarios"
            ],
            "secondary_goals": [
                "Delegar tareas operativas sin perder visibilidad",
                "Automatizar solicitudes de reposición"
            ],
            "functional_needs": [
                "Dashboard con KPIs en tiempo real",
                "Alertas de anomalías automáticas",
                "Exportación a Excel/PDF con un click"
            ],
            "emotional_needs": [
                "Confianza en que los números son correctos",
                "Sensación de control sobre la operación",
                "No sentirse abrumado por la cantidad de datos"
            ]
        },
        "frustrations": [
            "Demasiados clicks para conciliar caja",
            "Datos dispersos entre múltiples pantallas",
            "No hay alertas proactivas de anomalías",
            "El cierre semanal requiere cruce manual",
            "Falta visibilidad de stock en tiempo real desde admin"
        ],
        "scenarios": [
            {
                "title": "Cierre de Jornada",
                "context": "Domingo 4am, post-evento. Staff esperando para irse.",
                "goal": "Cerrar noche, validar arqueo, aprobar balances de barra y caja",
                "steps": [
                    "Abrir admin-workdays → tab Night Chief",
                    "Revisar KPIs de la noche (ventas, faltantes)",
                    "Validar arqueos de barra y caja",
                    "Aprobar cierre → cambiar estado a 'Cerrada'",
                    "Verificar que todo sincronizó con Zoco"
                ],
                "pain_points": [
                    "Si hay descalce, el proceso se alarga 15+ min",
                    "No hay pre-flight checklist automático"
                ]
            },
            {
                "title": "Balance Semanal",
                "context": "Lunes por la mañana, oficina. Necesita reporte para socios.",
                "goal": "Consolidar P&L de la semana y exportar resumen",
                "steps": [
                    "Abrir admin-semanal",
                    "Seleccionar rango de fechas",
                    "Revisar ingresos vs gastos",
                    "Detectar anomalías (mermas, faltantes)",
                    "Exportar PDF para reunión de socios"
                ],
                "pain_points": [
                    "Los datos no siempre están listos el lunes",
                    "Falta drill-down por categoría desde el balance"
                ]
            }
        ],
        "quote": "Necesito ver todo en una pantalla. Si tengo que hacer más de 3 clicks para saber si la noche salió bien, algo está mal.",
        "screens_used": [
            "admin-index", "admin-workdays", "admin-semanal",
            "admin-central-stock", "admin-reportes", "admin-solicitudes",
            "admin-config", "admin-pagos"
        ],
        "design_implications": [
            "Optimizar para velocidad: < 2s de carga, 0 spinners innecesarios",
            "KPIs críticos siempre visibles sin scroll",
            "Atajos de teclado para acciones frecuentes",
            "Alertas proactivas (notificación push de anomalías)",
            "Un solo hub de cierre de noche (no tabs dispersos)"
        ]
    },

    "operativo": {
        "name": "Marcos «El Operativo»",
        "role": "Operativo",
        "archetype": "power_user",
        "tagline": "Gestión diaria: stock, solicitudes, ERP",
        "demographics": {
            "age_range": "25-35",
            "location_type": "Urbano — Buenos Aires",
            "occupation_category": "Empleado operativo full-time",
            "education_level": "Terciario / Técnico",
            "tech_proficiency": "Intermedio-Avanzado"
        },
        "psychographics": {
            "motivations": [
                "Mantener stock al día sin sorpresas",
                "Completar tareas rápido para irse a horario",
                "Evitar errores que generen reclamos"
            ],
            "values": [
                "Orden",
                "Previsibilidad",
                "Comunicación clara con admin"
            ],
            "attitudes": [
                "Metódico pero bajo presión de tiempo",
                "Prefiere listas y checklists",
                "Desconfía de automatizaciones que no entiende"
            ],
            "lifestyle": "Horario mixto (mañana operativa + noches de evento)"
        },
        "behaviors": {
            "usage_patterns": [
                "Diario: carga stock, revisa solicitudes pendientes",
                "Pre-evento: valida stock mínimo por barra",
                "Post-evento: registra devoluciones y mermas"
            ],
            "feature_preferences": [
                "operativo-stock (Control en tiempo real)",
                "operativo-solicitudes (Crear/seguir pedidos)",
                "operativo-workday (Jornada del día)",
                "scanner (Lectura de códigos)",
                "operativo-master-sku (Referencia de productos)"
            ],
            "interaction_style": "Task-oriented — entra, hace, sale",
            "learning_preference": "Aprende por repetición y ejemplo de colegas"
        },
        "needs_and_goals": {
            "primary_goals": [
                "Saber exactamente qué falta en stock",
                "Crear solicitudes sin fricciones",
                "Ver estado de sus pedidos en tiempo real"
            ],
            "secondary_goals": [
                "Entender por qué se rechazó una solicitud",
                "Acceder desde el celular en el depósito"
            ],
            "functional_needs": [
                "Búsqueda rápida de SKU por nombre o código",
                "Formulario de solicitud pre-llenado",
                "Feedback inmediato al guardar"
            ],
            "emotional_needs": [
                "No sentirse bloqueado esperando aprobaciones",
                "Saber que su trabajo se registró correctamente",
                "No ser culpado por errores del sistema"
            ]
        },
        "frustrations": [
            "Datos dispersos entre módulos sin conexión obvia",
            "No sabe si su solicitud fue vista o ignorada",
            "El scanner es lento en conexión débil",
            "No hay forma rápida de reportar mermas",
            "Tiene que recordar códigos de SKU de memoria"
        ],
        "scenarios": [
            {
                "title": "Reposición de Stock Pre-Evento",
                "context": "Viernes 16hs, preparando barras para la noche.",
                "goal": "Verificar stock y crear solicitudes de lo faltante",
                "steps": [
                    "Abrir operativo-stock",
                    "Filtrar por barra asignada",
                    "Identificar items bajo mínimo",
                    "Crear solicitud agrupada",
                    "Confirmar envío y verificar estado"
                ],
                "pain_points": [
                    "No sabe el 'mínimo ideal' de cada item",
                    "Si la conexión falla pierde los datos cargados"
                ]
            }
        ],
        "quote": "Solo necesito saber qué falta y poder pedirlo en 2 toques. No me hagas pensar.",
        "screens_used": [
            "operativo-index", "operativo-stock", "operativo-workday",
            "operativo-solicitudes", "scanner", "operativo-master-sku"
        ],
        "design_implications": [
            "Mobile-first: muchas tareas se hacen desde el depósito",
            "Feedback inmediato (toasts de confirmación, no modals)",
            "Auto-completar SKUs por nombre parcial",
            "Estado de solicitudes siempre visible (badge/pill)",
            "Modo offline para carga de stock en zonas sin WiFi"
        ]
    },

    "logistico": {
        "name": "Diego «El Logístico»",
        "role": "Logística",
        "archetype": "mobile_first",
        "tagline": "Recibe mercadería, distribuye entre barras, rastrea envíos",
        "demographics": {
            "age_range": "22-32",
            "location_type": "Urbano — zona depósito/venue",
            "occupation_category": "Responsable de logística",
            "education_level": "Secundario completo / Terciario",
            "tech_proficiency": "Intermedio"
        },
        "psychographics": {
            "motivations": [
                "Cumplir con los tiempos de entrega",
                "Evitar errores de cantidad",
                "Tener trazabilidad de lo que distribuyó"
            ],
            "values": [
                "Puntualidad",
                "Precisión",
                "Comunicación rápida"
            ],
            "attitudes": [
                "Práctico, prefiere apps simples",
                "Se frustra con pantallas complejas",
                "Trabaja bajo presión física y de tiempo"
            ],
            "lifestyle": "Trabajo físico, usa celular con una mano, guantes, depósito frío"
        },
        "behaviors": {
            "usage_patterns": [
                "Diario: recibe mercadería y distribuye",
                "Pre-evento: arma picks por barra",
                "Post-evento: registra devoluciones"
            ],
            "feature_preferences": [
                "logistica-recepcion (Recibir mercadería)",
                "logistica-distribucion (Armar órdenes)",
                "logistica-stock (Verificar depósito)",
                "logistica-seguimiento (Rastrear envíos)"
            ],
            "interaction_style": "Quick-scan — necesita botones grandes, pocos pasos",
            "learning_preference": "Visual/demo — aprende viendo a otros"
        },
        "needs_and_goals": {
            "primary_goals": [
                "Recibir y confirmar mercadería en < 3 min",
                "Distribuir a barras sin errores de cantidad",
                "Saber qué hay en depósito sin contar físicamente"
            ],
            "secondary_goals": [
                "Reportar items dañados o faltantes al recibir",
                "Ver historial de distribución por fecha"
            ],
            "functional_needs": [
                "Escáner de código de barras integrado",
                "Confirmación por lote (no item por item)",
                "Modo offline que sincronice después"
            ],
            "emotional_needs": [
                "No ser responsabilizado por errores de proveedor",
                "Sentir que el sistema le ahorra tiempo",
                "Confianza en que los números coinciden"
            ]
        },
        "frustrations": [
            "Sistema lento en el depósito (WiFi débil)",
            "Pantalla difícil de leer bajo luz del depósito",
            "Tiene que escribir cantidades con guantes",
            "No puede confirmar un lote entero, solo item por item",
            "Si se cierra la app pierde el progreso"
        ],
        "scenarios": [
            {
                "title": "Recepción de Mercadería",
                "context": "Martes 10am, camión del proveedor en puerta.",
                "goal": "Confirmar entrega, registrar faltantes, almacenar",
                "steps": [
                    "Abrir logistica-recepcion",
                    "Escanear remito o seleccionar orden de compra",
                    "Verificar cantidades vs lo pedido",
                    "Marcar items recibidos / faltantes",
                    "Confirmar recepción → stock se actualiza"
                ],
                "pain_points": [
                    "Si hay diferencia con el remito, no sabe qué hacer",
                    "El proceso toma 10 min cuando debería tomar 3"
                ]
            }
        ],
        "quote": "Si tengo que sacarme los guantes para usar la app, ya perdí tiempo. Necesito botones grandes y pocos pasos.",
        "screens_used": [
            "logistica-index", "logistica-stock", "logistica-distribucion",
            "logistica-recepcion", "logistica-seguimiento"
        ],
        "design_implications": [
            "Target areas grandes (mínimo 48px touch target)",
            "Alto contraste para legibilidad en depósito",
            "Confirmación por lote, no individual",
            "Persistencia de estado ante cortes de conexión",
            "Feedback háptico o sonoro al escanear"
        ]
    },

    "encargado": {
        "name": "Valentina «La Encargada»",
        "role": "Encargado/a de Barra o Caja",
        "archetype": "power_user",
        "tagline": "Monitor nocturno bajo presión: arqueo, personal, cierre",
        "demographics": {
            "age_range": "24-35",
            "location_type": "Venue — en la barra/caja durante evento",
            "occupation_category": "Encargado/a de turno",
            "education_level": "Secundario completo / Terciario",
            "tech_proficiency": "Intermedio"
        },
        "psychographics": {
            "motivations": [
                "Cerrar la noche sin errores de arqueo",
                "Mantener al staff coordinado",
                "Evitar faltantes de caja"
            ],
            "values": [
                "Responsabilidad",
                "Trabajo en equipo",
                "Transparencia financiera"
            ],
            "attitudes": [
                "Alta presión, necesita respuestas instantáneas",
                "Confía en rutinas establecidas",
                "Quiere que el sistema le diga qué hacer, no al revés"
            ],
            "lifestyle": "100% nocturno durante eventos, entorno ruidoso, multi-tasking"
        },
        "behaviors": {
            "usage_patterns": [
                "Pre-noche: revisa asignación de personal",
                "Durante noche: monitorea KPIs en real-time",
                "Post-noche: ejecuta cierre de caja/barra"
            ],
            "feature_preferences": [
                "encargado-barra-noche / encargado-caja-noche (Cierre)",
                "encargado-*-personal (Asignación de staff)",
                "Dashboard de KPIs en tiempo real"
            ],
            "interaction_style": "Glanceable — mira la pantalla 3 segundos entre tareas",
            "learning_preference": "Aprende con checklist paso a paso"
        },
        "needs_and_goals": {
            "primary_goals": [
                "Ver KPIs de la noche en tiempo real",
                "Ejecutar cierre en < 3 minutos",
                "Reportar novedades al admin instantáneamente"
            ],
            "secondary_goals": [
                "Verificar que todo el staff fichó entrada",
                "Detectar anomalías de caja durante la noche"
            ],
            "functional_needs": [
                "Dashboard real-time con números grandes",
                "Checklist guiado para cierre nocturno",
                "Notificación push si hay anomalía"
            ],
            "emotional_needs": [
                "No sentir pánico si los números no cierran",
                "Saber que el admin verá su trabajo bien hecho",
                "Confianza en el proceso de cierre"
            ]
        },
        "frustrations": [
            "No ve KPIs en tiempo real durante la noche",
            "El cierre de caja requiere muchos pasos manuales",
            "No sabe si el admin aprobó su cierre",
            "La pantalla es difícil de leer en ambiente oscuro",
            "Si se equivoca en el arqueo, no puede corregirlo fácil"
        ],
        "scenarios": [
            {
                "title": "Cierre Nocturno de Barra",
                "context": "Domingo 3:30am, evento terminando, staff cansado.",
                "goal": "Cerrar caja de barra, registrar arqueo, reportar al admin",
                "steps": [
                    "Abrir encargado-barra-noche",
                    "Seguir checklist de cierre guiado",
                    "Ingresar conteo de efectivo",
                    "Registrar observaciones (mermas, incidentes)",
                    "Enviar cierre al admin para aprobación"
                ],
                "pain_points": [
                    "Si falta $500, no sabe si es error de conteo o faltante real",
                    "El sistema no guía sobre qué hacer ante discrepancia"
                ]
            }
        ],
        "quote": "A las 3am no puedo pensar. Necesito que la app me diga: 'hacé esto, después esto, listo'.",
        "screens_used": [
            "encargado-barra-index", "encargado-barra-noche",
            "encargado-barra-personal", "encargado-caja-index",
            "encargado-caja-noche", "encargado-caja-personal"
        ],
        "design_implications": [
            "Modo oscuro obligatorio (entorno nightclub)",
            "Números extra grandes en KPIs (legible a 1m)",
            "Cierre guiado tipo wizard (paso 1 de 5)",
            "Real-time updates via Supabase Channels",
            "Feedback visual + sonoro ante anomalías"
        ]
    }
}


# ═══════════════════════════════════════════════════════════════
# PERSONA GENERATOR CLASS
# ═══════════════════════════════════════════════════════════════

class PersonaGenerator:
    """Generate data-driven personas from user research"""

    def __init__(self):
        self.personas = DOMAIN_PERSONAS
        self.archetype_templates = {
            'power_user': {
                'characteristics': ['tech-savvy', 'frequent user', 'efficiency-focused'],
                'quote': "I need tools that can keep up with my workflow"
            },
            'casual_user': {
                'characteristics': ['occasional user', 'basic needs', 'prefers simplicity'],
                'quote': "I just want it to work without having to think about it"
            },
            'business_user': {
                'characteristics': ['professional context', 'ROI-focused', 'team collaboration'],
                'quote': "I need to show clear value to my stakeholders"
            },
            'mobile_first': {
                'characteristics': ['primarily mobile', 'on-the-go', 'quick interactions'],
                'quote': "My phone is my primary device"
            }
        }

    def get_persona(self, role: str) -> Optional[Dict]:
        """Get a specific persona by role key"""
        return self.personas.get(role)

    def get_all_personas(self) -> Dict:
        """Get all domain personas"""
        return self.personas

    def generate_from_data(self, user_data: List[Dict],
                           interview_insights: List[Dict] = None) -> Dict:
        """Generate persona from raw user data (extensible method)"""
        patterns = self._analyze_patterns(user_data)
        archetype = self._identify_archetype(patterns)

        persona = {
            'name': f"Generated Persona ({archetype})",
            'archetype': archetype,
            'tagline': self._generate_tagline(patterns),
            'demographics': self._aggregate_demographics(user_data),
            'psychographics': self._extract_psychographics(patterns, interview_insights),
            'behaviors': self._analyze_behaviors(user_data),
            'needs_and_goals': self._identify_needs(patterns, interview_insights),
            'frustrations': self._extract_frustrations(patterns, interview_insights),
            'scenarios': [],
            'quote': self._select_quote(interview_insights, archetype),
            'data_points': {
                'sample_size': len(user_data),
                'confidence': 'High' if len(user_data) > 50 else 'Medium' if len(user_data) > 20 else 'Low'
            },
            'design_implications': self._derive_implications(patterns)
        }
        return persona

    # ── Pattern Analysis ──────────────────────────────────────

    def _analyze_patterns(self, user_data: List[Dict]) -> Dict:
        patterns = {
            'usage_frequency': defaultdict(int),
            'feature_usage': defaultdict(int),
            'devices': defaultdict(int),
            'contexts': defaultdict(int),
            'pain_points': []
        }
        for user in user_data:
            patterns['usage_frequency'][user.get('usage_frequency', 'medium')] += 1
            for feat in user.get('features_used', []):
                patterns['feature_usage'][feat] += 1
            patterns['devices'][user.get('primary_device', 'desktop')] += 1
            patterns['contexts'][user.get('usage_context', 'work')] += 1
            if 'pain_points' in user:
                patterns['pain_points'].extend(user['pain_points'])
        return patterns

    def _identify_archetype(self, patterns: Dict) -> str:
        freq = max(patterns['usage_frequency'].items(), key=lambda x: x[1])[0] if patterns['usage_frequency'] else 'medium'
        device = max(patterns['devices'].items(), key=lambda x: x[1])[0] if patterns['devices'] else 'desktop'
        if freq == 'daily' and len(patterns['feature_usage']) > 10:
            return 'power_user'
        elif device in ['mobile', 'tablet']:
            return 'mobile_first'
        elif patterns['contexts'].get('work', 0) > patterns['contexts'].get('personal', 0):
            return 'business_user'
        return 'casual_user'

    def _generate_tagline(self, patterns: Dict) -> str:
        freq = max(patterns['usage_frequency'].items(), key=lambda x: x[1])[0] if patterns['usage_frequency'] else 'regular'
        ctx = max(patterns['contexts'].items(), key=lambda x: x[1])[0] if patterns['contexts'] else 'general'
        return f"A {freq} user in a {ctx} context"

    def _aggregate_demographics(self, user_data: List[Dict]) -> Dict:
        ages = [u.get('age', 30) for u in user_data if 'age' in u]
        avg = sum(ages) / len(ages) if ages else 30
        return {
            'age_range': '18-24' if avg < 25 else '25-34' if avg < 35 else '35-44' if avg < 45 else '45+',
            'tech_proficiency': 'Intermediate'
        }

    def _extract_psychographics(self, patterns: Dict, interviews=None) -> Dict:
        p = {'motivations': [], 'values': [], 'attitudes': [], 'lifestyle': ''}
        if patterns['usage_frequency'].get('daily', 0) > 0:
            p['motivations'].append('Efficiency')
            p['values'].append('Time-saving')
        if interviews:
            for i in interviews:
                p['motivations'].extend(i.get('motivations', []))
                p['values'].extend(i.get('values', []))
        p['motivations'] = list(set(p['motivations']))[:5]
        p['values'] = list(set(p['values']))[:5]
        return p

    def _analyze_behaviors(self, user_data: List[Dict]) -> Dict:
        all_feats = []
        for u in user_data:
            all_feats.extend(u.get('features_used', []))
        return {
            'feature_preferences': [f for f, _ in Counter(all_feats).most_common(5)],
            'interaction_style': 'Exploratory' if len(set(all_feats)) > 10 else 'Focused'
        }

    def _identify_needs(self, patterns: Dict, interviews=None) -> Dict:
        needs = {'primary_goals': [], 'functional_needs': [], 'emotional_needs': []}
        if patterns['contexts'].get('work', 0) > 0:
            needs['primary_goals'].append('Professional productivity')
        if interviews:
            for i in interviews:
                needs['primary_goals'].extend(i.get('goals', [])[:2])
        needs['emotional_needs'] = ['Feel confident', 'Trust the system']
        return needs

    def _extract_frustrations(self, patterns: Dict, interviews=None) -> List[str]:
        if patterns['pain_points']:
            return [p for p, _ in Counter(patterns['pain_points']).most_common(5)]
        return ['Slow loading', 'Confusing navigation']

    def _select_quote(self, interviews=None, archetype='casual_user') -> str:
        if interviews:
            for i in interviews:
                if 'quotes' in i and i['quotes']:
                    return i['quotes'][0]
        return self.archetype_templates[archetype]['quote']

    def _derive_implications(self, patterns: Dict) -> List[str]:
        imp = []
        if patterns['usage_frequency'].get('daily', 0) > patterns['usage_frequency'].get('weekly', 0):
            imp.append('Optimize for speed')
            imp.append('Provide keyboard shortcuts')
        if patterns['devices'].get('mobile', 0) > 0:
            imp.append('Mobile-first design')
        return imp[:5]

    # ── Formatted Output ──────────────────────────────────────

    def format_persona(self, persona: Dict) -> str:
        """Format a single persona for terminal display"""
        lines = []
        lines.append("=" * 64)
        lines.append(f"  PERSONA: {persona['name']}")
        lines.append(f"  Rol: {persona.get('role', persona.get('archetype', ''))}")
        lines.append("=" * 64)
        lines.append(f"\n  📝 {persona['tagline']}")
        lines.append(f"  💬 \"{persona['quote']}\"\n")

        # Demographics
        lines.append("  👤 DEMOGRAFÍA")
        for k, v in persona.get('demographics', {}).items():
            if v:
                lines.append(f"     • {k.replace('_', ' ').title()}: {v}")

        # Psychographics
        lines.append("\n  🧠 PSICOGRAFÍA")
        psych = persona.get('psychographics', {})
        if psych.get('motivations'):
            lines.append(f"     Motivaciones: {', '.join(psych['motivations'])}")
        if psych.get('values'):
            lines.append(f"     Valores: {', '.join(psych['values'])}")

        # Goals
        lines.append("\n  🎯 OBJETIVOS")
        goals = persona.get('needs_and_goals', {})
        for g in goals.get('primary_goals', [])[:4]:
            lines.append(f"     • {g}")

        # Frustrations
        lines.append("\n  😤 FRUSTRACIONES")
        for f in persona.get('frustrations', [])[:4]:
            lines.append(f"     • {f}")

        # Behaviors
        lines.append("\n  📊 COMPORTAMIENTO")
        beh = persona.get('behaviors', {})
        for p in beh.get('usage_patterns', beh.get('feature_preferences', []))[:3]:
            lines.append(f"     • {p}")

        # Design Implications
        lines.append("\n  💡 IMPLICACIONES DE DISEÑO")
        for d in persona.get('design_implications', [])[:4]:
            lines.append(f"     → {d}")

        # Screens
        if 'screens_used' in persona:
            lines.append(f"\n  🖥️  PANTALLAS: {', '.join(persona['screens_used'][:6])}")

        # Scenarios
        if persona.get('scenarios'):
            lines.append("\n  📋 ESCENARIO PRINCIPAL")
            s = persona['scenarios'][0]
            lines.append(f"     {s['title']}: {s['context']}")
            for step in s.get('steps', [])[:4]:
                lines.append(f"       → {step}")

        # Data points
        dp = persona.get('data_points', {})
        if dp:
            lines.append(f"\n  📈 Datos: muestra={dp.get('sample_size', 'N/A')}, confianza={dp.get('confidence', 'N/A')}")

        lines.append("")
        return "\n".join(lines)


# ═══════════════════════════════════════════════════════════════
# CLI
# ═══════════════════════════════════════════════════════════════

def main():
    gen = PersonaGenerator()
    args = [a.lower() for a in sys.argv[1:]]

    output_json = 'json' in args
    role_filter = None

    for a in args:
        if a != 'json' and a in DOMAIN_PERSONAS:
            role_filter = a
            break

    if role_filter:
        persona = gen.get_persona(role_filter)
        if not persona:
            print(f"Error: Persona '{role_filter}' no encontrada.")
            print(f"Roles disponibles: {', '.join(DOMAIN_PERSONAS.keys())}")
            sys.exit(1)
        if output_json:
            print(json.dumps(persona, indent=2, ensure_ascii=False))
        else:
            print(gen.format_persona(persona))
    else:
        all_personas = gen.get_all_personas()
        if output_json:
            print(json.dumps(all_personas, indent=2, ensure_ascii=False))
        else:
            for role, persona in all_personas.items():
                print(gen.format_persona(persona))
                print()


if __name__ == "__main__":
    main()
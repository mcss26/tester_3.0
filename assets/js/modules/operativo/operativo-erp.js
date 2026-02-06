(async function () {
    // Auth Guard
    // Roles permitidos tomados del HTML: data-allowed-roles="operativo,staff_barra,staff_operativo"
    const session = await window.Auth.guardOrRedirect(['operativo', 'staff_barra', 'staff_operativo']);
    if (!session) return;

    console.log('Operativo ERP landing loaded');
})();

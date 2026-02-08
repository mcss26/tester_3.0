(async function () {
    // Auth Guard
    // Roles permitidos tomados del HTML: data-allowed-roles="operativo,staff_barra,staff_operativo,admin"
    const session = await window.Auth.guardOrRedirect(['operativo', 'staff_barra', 'staff_operativo', 'admin']);
    if (!session) return;

    console.log('Operativo ERP landing loaded');
})();

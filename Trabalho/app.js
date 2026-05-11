// 1. VERIFICAÇÃO DE LOGIN UNIVERSAL (Corre em todas as páginas)
const currentUserData = sessionStorage.getItem('greenherb_user');
if (!currentUserData) {
    window.location.href = 'login.html';
}
const currentUser = JSON.parse(currentUserData);

document.addEventListener('DOMContentLoaded', () => {
    // --- CABEÇALHO GLOBAL ---
    document.getElementById('userNameDisplay').textContent = `Olá, ${currentUser.nome}`;
    const roleBadge = document.getElementById('userRoleBadge');
    roleBadge.textContent = currentUser.role;

    // Cores da Badge baseadas no Role
    if (currentUser.role === 'Administrador') roleBadge.style.background = '#212121';
    else if (currentUser.role === 'Responsavel') roleBadge.style.background = '#f57c00';
    else roleBadge.style.background = '#1976d2'; // Técnico

    // Logout
    document.getElementById('btnLogout').addEventListener('click', () => {
        sessionStorage.removeItem('greenherb_user');
        window.location.href = 'login.html';
    });

    // --- LÓGICA DO DASHBOARD (index.html) ---
    const listaPlanos = document.getElementById('listaPlanos');
    if (listaPlanos) {
        renderizarPlanos();
    }

    function renderizarPlanos() {
        const planos = JSON.parse(localStorage.getItem('greenherb_planos')) || [];

        // Atualizar Estatísticas
        document.getElementById('totalPlanos').textContent = planos.length;
        document.getElementById('totalEmergencias').textContent = planos.filter(p => p.tipo === 'Emergencia').length;

        listaPlanos.innerHTML = '';
        if (planos.length === 0) {
            listaPlanos.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: #777;">Ainda não há planos registados.</p>';
            return;
        }

        planos.reverse().forEach(plano => { // reverse para mostrar o mais recente primeiro
            const card = document.createElement('div');
            card.className = 'plan-card';
            const badgeClass = plano.tipo.toLowerCase();

            // Determinar o que mostrar nos detalhes
            let detalhes = '';
            if (plano.tipo === 'Regular') detalhes = `Rega: ${plano.detalhes.rega}`;
            else if (plano.tipo === 'Emergencia') detalhes = `Ação: ${plano.detalhes.intervencao}`;
            else detalhes = `Motivo: ${plano.detalhes.motivo}`;

            card.innerHTML = `
                <h4>${plano.nome}</h4>
                <p><strong>Erva:</strong> ${plano.erva}</p>
                <p><span class="badge ${badgeClass}">${plano.tipo}</span></p>
                <hr style="margin: 10px 0; border: 0; border-top: 1px solid #c8e6c9;">
                <p style="font-size: 0.9rem;">${detalhes}</p>
                <p style="font-size: 0.75rem; color: #888; margin-top: 10px;">👤 ${plano.criadoPor} | 📅 ${plano.dataRegisto}</p>
            `;
            listaPlanos.appendChild(card);
        });
    }

    // --- LÓGICA DO NOVO PLANO (novo-plano.html) ---
    const planoForm = document.getElementById('planoForm');
    if (planoForm) {
        const tipoPlanoSelect = document.getElementById('tipoPlano');
        const checkboxAutorizacao = document.getElementById('autorizacaoResp');
        const avisoAutorizacao = document.getElementById('avisoAutorizacao');

        const seccoes = {
            'Regular': document.getElementById('camposRegular'),
            'Emergencia': document.getElementById('camposEmergencia'),
            'Pontual': document.getElementById('camposPontual')
        };

        // Mostrar/Esconder secções e aplicar regras de negócio
        tipoPlanoSelect.addEventListener('change', (e) => {
            Object.values(seccoes).forEach(sec => sec.classList.add('hidden'));
            const selecionado = e.target.value;

            if (selecionado && seccoes[selecionado]) {
                seccoes[selecionado].classList.remove('hidden');
            }

            // REGRA DE NEGÓCIO: Só Responsáveis e Admins podem autorizar Planos Pontuais
            if (selecionado === 'Pontual') {
                if (currentUser.role === 'Tecnico') {
                    checkboxAutorizacao.disabled = true; // Bloqueia a checkbox
                    checkboxAutorizacao.checked = false;
                    avisoAutorizacao.classList.remove('hidden');
                } else {
                    checkboxAutorizacao.disabled = false;
                    avisoAutorizacao.classList.add('hidden');
                }
            }
        });

        // Guardar Plano
        planoForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const tipo = tipoPlanoSelect.value;

            if (tipo === 'Pontual' && !checkboxAutorizacao.checked) {
                alert('Impossível guardar: Falta autorização do Responsável Técnico!');
                return;
            }

            const novoPlano = {
                id: Date.now(),
                nome: document.getElementById('nomePlano').value,
                erva: document.getElementById('ervaAromatica').value,
                tipo: tipo,
                criadoPor: currentUser.nome, // Fica guardado quem criou!
                dataRegisto: new Date().toLocaleString('pt-PT')
            };

            if (tipo === 'Regular') {
                novoPlano.detalhes = {
                    tempMin: document.getElementById('tempMin').value,
                    tempMax: document.getElementById('tempMax').value,
                    rega: document.getElementById('planoRega').value
                };
            } else if (tipo === 'Emergencia') {
                novoPlano.detalhes = {
                    intervencao: document.getElementById('tipoIntervencao').value,
                    dosagem: document.getElementById('dosagem').value
                };
            } else if (tipo === 'Pontual') {
                novoPlano.detalhes = { motivo: document.getElementById('motivoPontual').value };
            }

            // Adicionar ao LocalStorage
            let planos = JSON.parse(localStorage.getItem('greenherb_planos')) || [];
            planos.push(novoPlano);
            localStorage.setItem('greenherb_planos', JSON.stringify(planos));

            // Voltar ao Dashboard
            window.location.href = 'index.html';
        });
    }
});
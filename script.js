document.addEventListener('DOMContentLoaded', () => {
    // --- 1. VARIÁVEIS DE ESTADO ---
    const stats = {
        life: {
            current: 0,
            max: 0,
            bar: document.querySelector('.life-bar .stat-bar'),
            currentEl: document.getElementById('current-life'),
            maxEl: document.getElementById('max-life')
        },
        sanity: {
            current: 0,
            max: 0,
            bar: document.querySelector('.sanity-bar .stat-bar'),
            currentEl: document.getElementById('current-sanity'),
            maxEl: document.getElementById('max-sanity')
        }
    };

    const storageKey = 'rpgPanelState';

    // --- 2. FUNÇÕES DE PERSISTÊNCIA (localStorage) ---

    function loadState() {
        const savedState = localStorage.getItem(storageKey);
        if (savedState) {
            const data = JSON.parse(savedState);
            
            stats.life.current = parseInt(data.life.current) || 0;
            stats.life.max = parseInt(data.life.max) || 0;
            stats.sanity.current = parseInt(data.sanity.current) || 0;
            stats.sanity.max = parseInt(data.sanity.max) || 0;

            updatePanel('life');
            updatePanel('sanity');
        }
    }

    function saveState() {
        const stateToSave = {
            life: { current: stats.life.current, max: stats.life.max },
            sanity: { current: stats.sanity.current, max: stats.sanity.max }
        };
        localStorage.setItem(storageKey, JSON.stringify(stateToSave));
    }


    // --- 3. FUNÇÕES DE ATUALIZAÇÃO E RENDERIZAÇÃO ---

    function updateBarVisual(statId) {
        const stat = stats[statId];
        const bar = stat.bar;
        const current = stat.current;
        const max = stat.max;

        bar.classList.remove('is-critical', 'is-zero');

        if (current === 0) {
            // Zerado
            bar.classList.add('is-zero');
            bar.style.backgroundSize = '0% 100%';
        } else {
            // Crítico (Atual <= 5 e > 0)
            if (current <= 5) {
                bar.classList.add('is-critical');
            }
            
            // Preenchimento da barra
            const percentage = max > 0 ? (current / max) * 100 : 0;
            bar.style.backgroundSize = `${percentage}% 100%`;
        }
    }

    function updatePanel(statId) {
        const stat = stats[statId];
        
        // Garante limites (0 e Máximo)
        stat.current = Math.min(stat.current, stat.max);
        stat.current = Math.max(0, stat.current);

        // Atualiza o DOM
        stat.currentEl.textContent = stat.current;
        stat.maxEl.value = stat.max;

        // Aplica regras visuais
        updateBarVisual(statId);
        
        // Salva o novo estado
        saveState();
    }


    // --- 4. LISTENERS DE EVENTOS ---

    // Listener para os botões de +/-
    document.querySelectorAll('.control-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const statId = e.target.dataset.target;
            const action = e.target.dataset.action;
            const stat = stats[statId];
            
            if (action === 'increase') {
                stat.current += 1;
            } else if (action === 'decrease') {
                stat.current -= 1;
            }

            updatePanel(statId);
        });
    });

    // Listener para o input de valor Máximo
    document.querySelectorAll('.max-value').forEach(input => {
        input.addEventListener('input', (e) => {
            const statId = e.target.id.split('-')[1];
            const stat = stats[statId];
            
            const newMax = parseInt(e.target.value) || 0;
            stat.max = Math.max(0, newMax);
            
            updatePanel(statId); 
        });
    });

    // --- 5. INICIALIZAÇÃO ---
    loadState();
});

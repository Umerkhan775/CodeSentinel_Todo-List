(function () {
    const STORAGE_KEY = 'mini_todos_v1';
    const listEl = document.getElementById('list');
    const newInput = document.getElementById('newInput');
    const addBtn = document.getElementById('addBtn');
    const counter = document.getElementById('counter');
    const clearBtn = document.getElementById('clearBtn');
    const filterBtns = document.querySelectorAll('.filter-btn');

    let todos = load();
    let filter = 'all';

    function save() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    }
    function load() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (e) { return [] }
    }

    function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6) }

    function addTodo(text) {
        if (!text || !text.trim()) return;
        todos.unshift({ id: uid(), text: text.trim(), done: false });
        save();
        render();
    }

    function removeTodo(id) {
        const idx = todos.findIndex(t => t.id === id);
        if (idx === -1) return;
        todos.splice(idx, 1);
        save();
        render();
    }

    function toggleDone(id) {
        const t = todos.find(x => x.id === id);
        if (!t) return;
        t.done = !t.done;
        save();
        render();
    }

    function editTodo(id, newText) {
        const t = todos.find(x => x.id === id);
        if (!t) return;
        t.text = newText.trim();
        save();
        render();
    }

    function clearCompleted() {
        todos = todos.filter(t => !t.done);
        save();
        render();
    }

    function filtered() {
        if (filter === 'active') return todos.filter(t => !t.done);
        if (filter === 'completed') return todos.filter(t => t.done);
        return todos;
    }

    function render() {
        listEl.innerHTML = '';
        const items = filtered();
        items.forEach(t => {
            const li = document.createElement('li');
            li.className = 'todo';
            li.dataset.id = t.id;

            const chk = document.createElement('button');
            chk.className = 'checkbox' + (t.done ? ' checked' : '');
            chk.setAttribute('aria-pressed', String(t.done));
            chk.title = t.done ? 'Mark as active' : 'Mark as done';
            chk.addEventListener('click', () => toggleDone(t.id));

            const txtWrap = document.createElement('div');
            txtWrap.className = 'todo-text';

            const label = document.createElement('span');
            label.className = 'label' + (t.done ? ' completed' : '');
            label.textContent = t.text;

            // double-click to edit
            label.addEventListener('dblclick', () => {
                const input = document.createElement('input');
                input.value = t.text;
                txtWrap.innerHTML = '';
                txtWrap.appendChild(input);
                input.focus();
                // commit on enter or blur
                function commit() {
                    const value = input.value.trim();
                    if (value) editTodo(t.id, value);
                    else removeTodo(t.id);
                }
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') commit();
                    if (e.key === 'Escape') render();
                });
                input.addEventListener('blur', commit);
            });

            txtWrap.appendChild(label);

            const ctrls = document.createElement('div');
            ctrls.className = 'controls';

            const editBtn = document.createElement('button');
            editBtn.className = 'icon-btn';
            editBtn.title = 'Edit';
            editBtn.innerHTML = '✏️';
            editBtn.addEventListener('click', () => {
                label.dispatchEvent(new Event('dblclick'));
            });

            const delBtn = document.createElement('button');
            delBtn.className = 'icon-btn';
            delBtn.title = 'Delete';
            delBtn.innerHTML = '🗑️';
            delBtn.addEventListener('click', () => {
                li.classList.add('removing');
                setTimeout(() => removeTodo(t.id), 180);
            });

            ctrls.appendChild(editBtn);
            ctrls.appendChild(delBtn);

            li.appendChild(chk);
            li.appendChild(txtWrap);
            li.appendChild(ctrls);

            listEl.appendChild(li);
        });

        counter.textContent = todos.length + (todos.length === 1 ? ' item' : ' items');
        // update filter buttons active state
        filterBtns.forEach(b => b.classList.toggle('active', b.dataset.filter === filter));
    }

    // events
    addBtn.addEventListener('click', () => { addTodo(newInput.value); newInput.value = ''; newInput.focus(); });
    newInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') { addTodo(newInput.value); newInput.value = ''; } });

    clearBtn.addEventListener('click', clearCompleted);

    filterBtns.forEach(b => b.addEventListener('click', () => { filter = b.dataset.filter; render(); }));

    // initial render
    render();

    // expose for debugging (optional)
    window.__mini_todos = { get: () => todos, save, load };

})();
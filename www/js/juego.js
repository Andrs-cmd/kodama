// "Lluvia para el bosque": mueve a tu kodama y atrapa gotas; esquiva los bichos.
// 30 segundos. La primera partida del día le da experiencia al kodama.
import { kodamaSVG, reaccionar } from './kodama.js';
import { kodama, puntajeJuego } from './almacen.js';
import { sonidos, vibrar } from './sonido.js';

export function montarJuego(cont, { alTerminar } = {}) {
  const k = kodama();
  cont.innerHTML = `
    <div class="juego">
      <div class="juego-hud"><span>💧 <b data-pts>0</b></span><span>⏱ <b data-t>30</b></span><span>Récord <b>${k.juego?.mejor || 0}</b></span></div>
      <div class="juego-cielo">
        <div class="juego-kodama">${kodamaSVG(k, { expresion: 'feliz' })}</div>
        <div class="juego-intro">
          <p><strong>Lluvia para el bosque</strong></p>
          <p>Arrastra a ${k.nombre} para atrapar gotas 💧. Las doradas valen 3. Esquiva los bichos 🐛.</p>
          <button class="boton primario grande" data-jugar>Jugar</button>
        </div>
      </div>
    </div>`;
  const cielo = cont.querySelector('.juego-cielo');
  const kod = cont.querySelector('.juego-kodama');
  const $pts = cont.querySelector('[data-pts]');
  const $t = cont.querySelector('[data-t]');
  let x = 0.5, puntos = 0, fin = 0, raf = 0, cosas = [], ultimo = 0, proxima = 0, jugando = false;

  const mover = (clientX) => {
    const r = cielo.getBoundingClientRect();
    x = Math.max(0.06, Math.min(0.94, (clientX - r.left) / r.width));
    kod.style.left = `${x * 100}%`;
  };
  cielo.addEventListener('pointermove', (e) => jugando && mover(e.clientX));
  cielo.addEventListener('pointerdown', (e) => jugando && mover(e.clientX));
  const tecla = (e) => {
    if (!jugando) return;
    if (e.key === 'ArrowLeft') x = Math.max(0.06, x - 0.06);
    if (e.key === 'ArrowRight') x = Math.min(0.94, x + 0.06);
    kod.style.left = `${x * 100}%`;
  };
  document.addEventListener('keydown', tecla);

  function soltar(ahora) {
    const tipo = Math.random() < 0.18 ? 'bicho' : Math.random() < 0.12 ? 'oro' : 'gota';
    const el = document.createElement('span');
    el.className = `cae ${tipo}`;
    el.textContent = tipo === 'bicho' ? '🐛' : '';
    cielo.appendChild(el);
    const vel = 0.32 + Math.random() * 0.25 + (ahora - (fin - 30000)) / 30000 * 0.25;
    cosas.push({ el, tipo, x: 0.06 + Math.random() * 0.88, y: -0.05, vel });
  }

  function cuadro(t) {
    raf = requestAnimationFrame(cuadro);
    const dt = Math.min(50, t - (ultimo || t)) / 1000;
    ultimo = t;
    const queda = Math.max(0, Math.ceil((fin - t) / 1000));
    $t.textContent = queda;
    if (t >= proxima) {
      soltar(t);
      proxima = t + 380 + Math.random() * 380;
    }
    for (const c of cosas) {
      c.y += c.vel * dt;
      c.el.style.transform = `translate(${c.x * cielo.clientWidth}px, ${c.y * cielo.clientHeight}px)`;
      if (c.y > 0.8 && c.y < 0.92 && Math.abs(c.x - x) < 0.09) {
        c.hecho = true;
        if (c.tipo === 'bicho') {
          puntos = Math.max(0, puntos - 3);
          vibrar(40);
          kod.classList.add('golpe');
          setTimeout(() => kod.classList.remove('golpe'), 400);
        } else {
          puntos += c.tipo === 'oro' ? 3 : 1;
          sonidos.gota();
          if (c.tipo === 'oro') reaccionar(kod, 'salto');
        }
        $pts.textContent = puntos;
      }
      if (c.y > 1.05) c.hecho = true;
      if (c.hecho) c.el.remove();
    }
    cosas = cosas.filter((c) => !c.hecho);
    if (t >= fin) terminar();
  }

  function jugar() {
    cont.querySelector('.juego-intro').hidden = true;
    puntos = 0;
    $pts.textContent = 0;
    jugando = true;
    ultimo = 0;
    const ahora = performance.now();
    fin = ahora + 30000;
    proxima = ahora + 300;
    raf = requestAnimationFrame(cuadro);
  }

  function terminar() {
    cancelAnimationFrame(raf);
    jugando = false;
    cosas.forEach((c) => c.el.remove());
    cosas = [];
    const { ganada, mejor } = puntajeJuego(puntos);
    sonidos.logro();
    reaccionar(kod, 'festejo');
    const intro = cont.querySelector('.juego-intro');
    intro.hidden = false;
    intro.innerHTML = `<p><strong>¡${puntos} gotas!</strong></p><p>${puntos >= mejor && puntos > 0 ? '¡Nuevo récord! ' : `Récord: ${mejor}. `}${ganada ? `+${ganada} XP para ${kodama().nombre}.` : 'La experiencia del juego se gana una vez al día.'}</p><button class="boton primario grande" data-jugar>Otra vez</button>`;
    intro.querySelector('[data-jugar]').onclick = jugar;
    alTerminar?.(ganada);
  }

  cont.querySelector('[data-jugar]').onclick = jugar;
  return () => {
    cancelAnimationFrame(raf);
    document.removeEventListener('keydown', tecla);
  };
}

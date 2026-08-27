const header = document.querySelector('#site-header');
const revealItems = document.querySelectorAll('.reveal');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
document.querySelector('#year').textContent = new Date().getFullYear();
window.addEventListener('scroll', () => header.classList.toggle('scrolled', window.scrollY > 12), { passive: true });
if (reduceMotion || !('IntersectionObserver' in window)) {
  revealItems.forEach((item) => item.classList.add('visible'));
} else {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
    });
  }, { threshold: 0.14 });
  revealItems.forEach((item) => observer.observe(item));
}

const networkCanvas = document.querySelector('#network-bg');
const networkContext = networkCanvas.getContext('2d');
let networkPoints = [];
let networkFrame;

const resizeNetwork = () => {
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  networkCanvas.width = Math.round(window.innerWidth * pixelRatio);
  networkCanvas.height = Math.round(window.innerHeight * pixelRatio);
  networkCanvas.style.width = `${window.innerWidth}px`;
  networkCanvas.style.height = `${window.innerHeight}px`;
  networkContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

  const pointCount = Math.max(22, Math.min(46, Math.round(window.innerWidth / 34)));
  networkPoints = Array.from({ length: pointCount }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    vx: (Math.random() - .5) * .12,
    vy: (Math.random() - .5) * .12,
    radius: .7 + Math.random() * .85
  }));
};

const drawNetwork = () => {
  networkContext.clearRect(0, 0, window.innerWidth, window.innerHeight);
  networkPoints.forEach((point, index) => {
    if (!reduceMotion) {
      point.x = (point.x + point.vx + window.innerWidth) % window.innerWidth;
      point.y = (point.y + point.vy + window.innerHeight) % window.innerHeight;
    }

    networkContext.beginPath();
    networkContext.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
    networkContext.fillStyle = 'rgba(99, 230, 177, .46)';
    networkContext.fill();

    for (let next = index + 1; next < networkPoints.length; next += 1) {
      const other = networkPoints[next];
      const distance = Math.hypot(point.x - other.x, point.y - other.y);
      if (distance < 125) {
        networkContext.beginPath();
        networkContext.moveTo(point.x, point.y);
        networkContext.lineTo(other.x, other.y);
        networkContext.strokeStyle = `rgba(99, 230, 177, ${(.075 * (1 - distance / 125)).toFixed(3)})`;
        networkContext.lineWidth = .7;
        networkContext.stroke();
      }
    }
  });

  if (!reduceMotion) networkFrame = window.requestAnimationFrame(drawNetwork);
};

resizeNetwork();
drawNetwork();
window.addEventListener('resize', () => {
  window.cancelAnimationFrame(networkFrame);
  resizeNetwork();
  drawNetwork();
}, { passive: true });

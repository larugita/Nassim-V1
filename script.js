const revealItems = document.querySelectorAll(
  "main section, .project-card"
);

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.15
  }
);

revealItems.forEach((item) => {
  item.classList.add("reveal");
  revealObserver.observe(item);
});

const navLinks = document.querySelectorAll(".nav-links a");
const sections = document.querySelectorAll("main section[id]");

const navObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      navLinks.forEach((link) => {
        link.classList.toggle(
          "active",
          link.getAttribute("href") === `#${entry.target.id}`
        );
      });
    });
  },
  {
    threshold: 0.45
  }
);

sections.forEach((section) => navObserver.observe(section));

const canvas = document.querySelector("#spotlight-trail");
const context = canvas.getContext("2d");

const trailPoints = [];
const trailLife = 550;

function resizeCanvas() {
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

  canvas.width = window.innerWidth * pixelRatio;
  canvas.height = window.innerHeight * pixelRatio;

  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

document.addEventListener("pointermove", (event) => {
  const lastPoint = trailPoints[trailPoints.length - 1];

  if (
    !lastPoint ||
    Math.hypot(event.clientX - lastPoint.x, event.clientY - lastPoint.y) > 4
  ) {
    trailPoints.push({
      x: event.clientX,
      y: event.clientY,
      createdAt: performance.now()
    });
  }
});

function drawTrail(time) {
  context.clearRect(0, 0, window.innerWidth, window.innerHeight);

  const visiblePoints = trailPoints.filter(
    (point) => time - point.createdAt < trailLife
  );

  trailPoints.length = 0;
  trailPoints.push(...visiblePoints);

  visiblePoints.forEach((point) => {
    const age = time - point.createdAt;
    const progress = age / trailLife;
    const opacity = Math.pow(1 - progress, 2);
    const radius = 80 * (1 - progress * 0.35);

    const glow = context.createRadialGradient(
      point.x,
      point.y,
      0,
      point.x,
      point.y,
      radius
    );

    glow.addColorStop(0, `rgba(191, 160, 106, ${opacity * 0.14})`);
    glow.addColorStop(0.4, `rgba(191, 160, 106, ${opacity * 0.05})`);
    glow.addColorStop(1, "rgba(191, 160, 106, 0)");

    context.fillStyle = glow;
    context.beginPath();
    context.arc(point.x, point.y, radius, 0, Math.PI * 2);
    context.fill();
  });

  requestAnimationFrame(drawTrail);
}

requestAnimationFrame(drawTrail);

const pageLinks = document.querySelectorAll('a[href^="#"]');

function easeInOutCubic(progress) {
  return progress < 0.5
    ? 4 * progress * progress * progress
    : 1 - Math.pow(-2 * progress + 2, 3) / 2;
}

function animateScroll(targetPosition) {
  const startPosition = window.scrollY;
  const distance = targetPosition - startPosition;
  const duration = 700;
  const startTime = performance.now();

  function step(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easeInOutCubic(progress);

    window.scrollTo(0, startPosition + distance * easedProgress);

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}

pageLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = link.getAttribute("href");
    const targetSection = document.querySelector(targetId);

    if (!targetSection) return;

    event.preventDefault();

    const targetPosition =
      targetSection.getBoundingClientRect().top + window.scrollY;

    animateScroll(targetPosition);
    history.pushState(null, "", targetId);
  });
});
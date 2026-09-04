const year = document.querySelector("#year");

if (year) {
  year.textContent = new Date().getFullYear();
}

/* Scroll-reveal animation */

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
    threshold: 0.12
  }
);

revealItems.forEach((item) => {
  item.classList.add("reveal");
  revealObserver.observe(item);
});

/* Active navigation state */

const navLinks = document.querySelectorAll(".nav-links a");
const sections = document.querySelectorAll("main section[id]");

function setActiveNav(sectionId) {
  navLinks.forEach((link) => {
    link.classList.toggle(
      "active",
      link.getAttribute("href") === `#${sectionId}`
    );
  });
}

const navObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        setActiveNav(entry.target.id);
      }
    });
  },
  {
    rootMargin: "-25% 0px -60% 0px",
    threshold: 0
  }
);

sections.forEach((section) => navObserver.observe(section));

/* Custom smooth scrolling */

const pageLinks = document.querySelectorAll('a[href^="#"]');
const siteHeader = document.querySelector(".site-header");

let activeScrollAnimation;

function easeInOutCubic(progress) {
  return progress < 0.5
    ? 4 * progress * progress * progress
    : 1 - Math.pow(-2 * progress + 2, 3) / 2;
}

function animateScroll(targetPosition) {
  if (activeScrollAnimation) {
    cancelAnimationFrame(activeScrollAnimation);
  }

  const startPosition = window.scrollY;
  const distance = targetPosition - startPosition;
  const duration = Math.min(
    850,
    Math.max(450, Math.abs(distance) * 0.35)
  );

  const startTime = performance.now();

  function step(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easeInOutCubic(progress);

    window.scrollTo(
      0,
      startPosition + distance * easedProgress
    );

    if (progress < 1) {
      activeScrollAnimation = requestAnimationFrame(step);
    }
  }

  activeScrollAnimation = requestAnimationFrame(step);
}

function scrollToSection(section) {
  const headerHeight = siteHeader ? siteHeader.offsetHeight : 0;

  const targetPosition = Math.max(
    0,
    section.getBoundingClientRect().top +
      window.scrollY -
      headerHeight -
      12
  );

  animateScroll(targetPosition);
}

pageLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = link.getAttribute("href");
    const targetSection = document.querySelector(targetId);

    if (!targetSection) return;

    event.preventDefault();

    scrollToSection(targetSection);
    history.pushState(null, "", targetId);
  });
});

window.addEventListener("popstate", () => {
  const targetSection = document.querySelector(window.location.hash);

  if (targetSection) {
    scrollToSection(targetSection);
  }
});

/* Cursor light trail */

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
    Math.hypot(
      event.clientX - lastPoint.x,
      event.clientY - lastPoint.y
    ) > 4
  ) {
    trailPoints.push({
      x: event.clientX,
      y: event.clientY,
      createdAt: performance.now()
    });
  }
});

function drawTrail(time) {
  context.clearRect(
    0,
    0,
    window.innerWidth,
    window.innerHeight
  );

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

    glow.addColorStop(
      0,
      `rgba(210, 178, 115, ${opacity * 0.14})`
    );

    glow.addColorStop(
      0.4,
      `rgba(210, 178, 115, ${opacity * 0.05})`
    );

    glow.addColorStop(
      1,
      "rgba(210, 178, 115, 0)"
    );

    context.fillStyle = glow;
    context.beginPath();
    context.arc(
      point.x,
      point.y,
      radius,
      0,
      Math.PI * 2
    );
    context.fill();
  });

  requestAnimationFrame(drawTrail);
}

requestAnimationFrame(drawTrail);
// Vercel Web Analytics
import { inject } from '@vercel/analytics';
inject();

// Existing menu toggle functionality
const toggle = document.querySelector(".menu-toggle");
const menu = document.querySelector(".menu");

if (toggle && menu) {
  toggle.addEventListener("click", () => {
    menu.classList.toggle("open");
  });

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => menu.classList.remove("open"));
  });
}

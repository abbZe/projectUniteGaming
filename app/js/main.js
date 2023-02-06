'use strict';

const mobileMenuButton = document.querySelector('.hamburger');
const mobileMenuCanvas = document.querySelector('.mobile-nav');

mobileMenuButton.addEventListener('click', function() {
  mobileMenuButton.classList.toggle('is-active');
  mobileMenuCanvas.classList.toggle('is-active');
});
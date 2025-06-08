export default function Footer() {
  const footer = document.createElement('footer');
  footer.className = 'w-full bg-gradient-to-r from-white via-blue-50 to-white/80 backdrop-blur border-t border-gray-200 mt-12 pt-10 pb-6 shadow-inner';
  footer.innerHTML = `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div class="text-center md:text-left">
          <span class="text-2xl font-extrabold bg-gradient-to-r from-blue-700 via-teal-500 to-blue-400 bg-clip-text text-transparent tracking-tight">StoryHub</span>
          <div class="mt-2 text-gray-500 text-sm font-medium">Share your story. Inspire the world.</div>
        </div>
        <div class="flex items-center justify-center gap-6">
          <a href="https://github.com/sifaq00" target="_blank" rel="noopener" aria-label="GitHub"
            class="group text-gray-500 hover:text-gray-900 transition-colors text-2xl">
            <span class="sr-only">GitHub</span>
            <i class="fab fa-github group-hover:scale-110 transition-transform duration-200"></i>
          </a>
          <a href="https://linkedin.com/in/muhammad-asifaq" target="_blank" rel="noopener" aria-label="LinkedIn"
            class="group text-blue-600 hover:text-blue-800 transition-colors text-2xl">
            <span class="sr-only">LinkedIn</span>
            <i class="fab fa-linkedin group-hover:scale-110 transition-transform duration-200"></i>
          </a>
          <a href="https://instagram.com/m.asfq_" target="_blank" rel="noopener" aria-label="Instagram"
            class="group text-pink-500 hover:text-pink-700 transition-colors text-2xl">
            <span class="sr-only">Instagram</span>
            <i class="fab fa-instagram group-hover:scale-110 transition-transform duration-200"></i>
          </a>
        </div>
      </div>
      <div class="border-t border-gray-100 mt-8 mb-4"></div>
      <div class="flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-gray-400 px-2">
        <span>© ${new Date().getFullYear()} <span class="font-semibold text-blue-700">StoryHub</span>. All rights reserved.</span>
        <span>Made with <span aria-label="love" class="text-pink-500">♥</span> by <a href="https://linkedin.com/in/muhammad-asifaq" target="_blank" rel="noopener" class="underline hover:text-blue-700">Muhammad Asifaq</a></span>
      </div>
    </div>
  `;
  return footer;
}
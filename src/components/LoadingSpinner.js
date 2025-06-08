export default function LoadingSpinner({ size = "md", color = "blue" }) {
    const sizeClasses = {
      sm: "h-8 w-8 border-2",
      md: "h-12 w-12 border-t-2 border-b-2",
      lg: "h-16 w-16 border-t-4 border-b-4"
    };
  
    const colorClasses = {
      blue: "border-blue-500",
      gray: "border-gray-500",
      white: "border-white"
    };
  
    const spinner = document.createElement('div');
    spinner.className = 'flex justify-center items-center min-h-[200px]';
  
    spinner.innerHTML = `
      <div class="animate-spin rounded-full ${sizeClasses[size]} ${colorClasses[color]}"></div>
    `;
  
    return spinner;
  }
export const Input = ({ label = "Button", variant = "text" }: any) => {
  return (
    <input
      className="cursor-pointer rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 focus:ring-1 focus:ring-gray-300 focus:outline-none"
      placeholder={label}
      type={variant}
    />
  );
};

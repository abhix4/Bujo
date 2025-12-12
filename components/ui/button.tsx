

export const ButtonComponent = ({ variant = "primary", label = "Button" }: any) => {
  const base = "px-4 py-2 rounded-lg font-medium hover:shadow-md cursor-pointer text-sm ";
  const cls =
    variant === "primary"
      ? "bg-[#323232] text-white hover:bg-[#454545]"
      : variant === "secondary"
        ? "bg-gray-200 text-gray-900"
        : variant === "danger"
          ? "border bg-white border-red-600 text-red-600 hover:bg-red-50"
          : "bg-white border border-gray-300 text-gray-900";
  return <button className={`${base} ${cls}`}>{label}</button>;
};

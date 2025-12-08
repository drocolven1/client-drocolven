import NavbarV from "@/components/NavbarV";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex flex-row h-screen w-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <NavbarV />
      <main className="w-screen">{children}</main>
    </div>
  );
}

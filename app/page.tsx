import  UiLibraryAssistant  from "@/components/chat-bot";
import { ButtonComponent } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="flex h-screen md:w-3xl flex-col gap-12 bg-[#F7F7F7]/20  border-r border-l border-[#E5E7EA]">
        <h1 className="text-2xl font-semibold border-b  border-[#E5E7EA] p-6">Component Library</h1>

        <div className="flex flex-col gap-6 p-12">
          <p className="text-xl">Buttons</p>
          <div className="flex flex-wrap gap-4">
            <ButtonComponent variant="primary" label="Primary" />
            <ButtonComponent variant="secondary" label="Secondary" />
            <ButtonComponent variant="danger" label="Danger" />
            <ButtonComponent variant="tertiary" label="Outline" />
          </div>
          <p className="text-xl">Input</p>
          <div className="flex flex-wrap gap-4">
            <Input label="Primary" />
          </div>
        </div>
      </div>
      <UiLibraryAssistant />
    </div>
  );
}

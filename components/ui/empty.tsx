import { FolderClosed } from "lucide-react";

interface EmptyProps {
    title: string;
}

export const Empty = ({ title }: EmptyProps) => {
    return (
        <div className="flex flex-col gap-2 items-center justify-center border border-black/10 px-8 border-dashed rounded-2xl py-12">
            <FolderClosed className="text-gray-500" />
            <p className="text-gray-500 text-lg">{title}</p>
        </div>
    );
};

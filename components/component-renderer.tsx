import { ButtonComponent } from "./ui/button";
import { Empty } from "./ui/empty";
import { Input } from "./ui/input";

export function ComponentRenderer({ spec }: { spec: any }) {
  if (!spec || typeof spec !== "object" || !spec.type) return null;

  const props = { ...spec.props, children: spec.children };

  switch (spec.type) {
    case "button":
      return <ButtonComponent {...{ variant: props.variant, ...props }} />;

    case "button-group":
      return (
        <div className="flex flex-col items-start gap-3 bg-white p-4 rounded-lg border border-gray-200">
          {props.label && <span className="text-sm font-medium text-gray-700">{props.label}</span>}
          <div className="flex gap-2 flex-wrap">
            {props.children?.map((c: any, i: number) => (
              <ComponentRenderer key={i} spec={c} />
            ))}
          </div>
        </div>
      );

    case "form":
      return (
        <div className="flex flex-col items-start gap-3 bg-white p-4 rounded-lg border border-gray-200 w-full">
          {props.label && <span className="text-sm font-medium text-gray-700">{props.label}</span>}
          {props.children?.map((c: any, i: number) => (
            <ComponentRenderer key={i} spec={c} />
          ))}
        </div>
      );

    case "input":
      return <Input {...{ label: "Input", ...props }} />;
    
    case "empty":
      return <Empty {...{  ...props }} />;

    default:
      return (
        <pre className="overflow-auto rounded bg-gray-50 p-2 text-xs">
          {JSON.stringify(spec, null, 2)}
        </pre>
      );
  }
}
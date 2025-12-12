
export async function* mockStreamResponse(prompt: string) {
  if (/buttons/i.test(prompt)) {
    const intro = "Sure, here are three button variants:";
    for (const char of intro) {
      yield char;
      await sleep(30);
    }
    yield "\n\n";
    await sleep(500);
    
    const comp = {
      type: "button-group",
      props: { label: "Demo Buttons" },
      children: [
        { type: "button", props: { variant: "primary", label: "Primary" } },
        { type: "button", props: { variant: "secondary", label: "Secondary" } },
        { type: "button", props: { variant: "ghost", label: "Ghost" } },
        { type: "button", props: { variant: "danger", label: "Ghost" } },
      ],
    };
    
    yield "```COMPONENT_JSON\n" + JSON.stringify(comp) + "\n```";
    return;
  }

  if (/button/i.test(prompt)) {
  const variantMatch = prompt.match(
    /(primary|secondary|outline|danger)\s+button/i
  );

  const variant = variantMatch ? variantMatch[1].toLowerCase() : "primary";

  const intro = `Sure, here is a ${variant} button:`;
  for (const char of intro) {
    yield char;
    await sleep(30);
  }

  yield "\n\n";
  await sleep(500);

  const comp = {
    type: "button",
    props: { variant, label: `${variant[0].toUpperCase() + variant.slice(1)}` },
  };

  yield "```COMPONENT_JSON\n" + JSON.stringify(comp) + "\n```";
  return;
}


  if (/form/i.test(prompt)) {
    const intro = "Here is a form to collect data:";
    for (const char of intro) {
      yield char;
      await sleep(30);
    }
    yield "\n\n";
    await sleep(500);
    
    const comp = {
      type: "form",
      props: { label: "Demo Form" },
      children: [
        { type: "input", props: { variant: "text", label: "Name" } },
        { type: "input", props: { variant: "number", label: "Age" } },
        { type: "button", props: { variant: "primary", label: "Submit" } },
      ],
    };
    
    yield "```COMPONENT_JSON\n" + JSON.stringify(comp) + "\n```";
    return;
  }

  if (/input/i.test(prompt)) {
    const intro = "Here is an input field:";
    for (const char of intro) {
      yield char;
      await sleep(30);
    }
    yield "\n\n";
    await sleep(500);
    
    const comp = {
      type: "input",
      props: { variant: "text", label: "Demo Input" },
    };
    
    yield "```COMPONENT_JSON\n" + JSON.stringify(comp) + "\n```";
    return;
  }


    if (/empty/i.test(prompt)) {
    const intro = "Sure, here is an empty state";
    for (const char of intro) {
      yield char;
      await sleep(30);
    }
    yield "\n\n";
    await sleep(500);
    
    const comp = {
      type: "empty",
      props: { title: "No data found" },
    };
    
    yield "```COMPONENT_JSON\n" + JSON.stringify(comp) + "\n```";
    return;
  }

  const reply = "Sorry, I couldn't detect a request for UI components. Try: 'Show me  buttons'.";
  for (const char of reply) {
    yield char;
    await sleep(30);
  }
}

function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

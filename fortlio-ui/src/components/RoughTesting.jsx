import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
// import { mdToPdf } from "md-to-p+++df";

import {
  Save,
  Settings,
  HelpCircle,
  Image as ImageIcon,
  Download,
  Pencil,
  X,
} from "lucide-react";

export default function EditorPage() {
  const [markdown, setMarkdown] = useState("");
  const [autoSave, setAutoSave] = useState(true);
  const [showSetting, setShowSetting] = useState(false);
  const [heightMargin, setHeightMargin] = useState(10);
  const [widthMargin, setWidthMargin] = useState(10);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("markdown");
    if (saved) {
      setMarkdown(saved);
    }
  }, []);

  useEffect(() => {
    if (autoSave) {
      localStorage.setItem("markdown", markdown);
    }
  }, [markdown, autoSave]);

  const saveMarkdown = () => {
    localStorage.setItem("markdown", markdown);

    alert("Saved");
  };

  const exportMD = () => {
    const blob = new Blob([markdown], {
      type: "text/markdown",
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;

    a.download = "document.md";

    a.click();
  };

  const exportPDF = () => {
    alert("PDF will connect with md-to-pdf");
  };

  const uploadImage = (e: any) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const url = URL.createObjectURL(file);

    setMarkdown(
      (prev) =>
        `${prev}

![image](${url})`,
    );
  };

  const words = markdown.trim() ? markdown.trim().split(/\s+/).length : 0;

  const characters = markdown.length;

  const username = localStorage.getItem("name");

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-400 bg-[#1E3A5F] relative">
        <div className="hidden md:flex items-center justify-between px-4 lg:px-8 py-3">
          <h1 className="text-2xl font-semibold tracking-wide text-white">
            Editor
          </h1>

          <div className="flex items-center gap-3 lg:gap-4">
            <div className="flex items-center gap-1 lg:gap-3 text-white">
              <button
                onClick={saveMarkdown}
                className="flex items-center gap-2 rounded-lg p-2 hover:bg-indigo-50 hover:text-indigo-600"
              >
                <Save size={20} />
                <span className="hidden lg:block">Save</span>
              </button>

              <label className="flex items-center gap-2 rounded-lg p-2 hover:bg-indigo-50 hover:text-indigo-600 cursor-pointer">
                <ImageIcon size={20} />
                <input
                  hidden
                  type="file"
                  accept="image/*"
                  onChange={uploadImage}
                />

                <span className="hidden lg:block">Image</span>
              </label>

              <button
                onClick={exportMD}
                className="flex items-center gap-2 rounded-lg p-2 hover:bg-indigo-50 hover:text-indigo-600"
              >
                <Download size={20} />

                <span className="hidden lg:block">Export</span>
              </button>

              <button
                onClick={() => setShowSetting(!showSetting)}
                className="rounded-lg p-2 hover:bg-indigo-50 hover:text-indigo-600"
              >
                <Settings size={20} />
              </button>


              <button
                onClick={() => window.open("https://markdown.co.in/", "_blank")}
                className="rounded-lg p-2 hover:bg-indigo-50 hover:text-indigo-600"
              >
                <HelpCircle size={20} />
              </button>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 font-semibold text-white">
              {username ? username[0].toUpperCase() : "A"}
            </div>
          </div>
        </div>

        {/* mobile */}

        <div className="md:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <h1 className="text-lg font-bold tracking-wide text-gray-900">
              Editor
            </h1>

            <div className="flex items-center gap-2">
              <button onClick={saveMarkdown} className="p-2 text-gray-700">
                <Save size={18} />
              </button>

              <label className="p-2 text-gray-700">
                <ImageIcon size={18} />

                <input
                  hidden
                  type="file"
                  accept="image/*"
                  onChange={uploadImage}
                />
              </label>

              <button onClick={exportPDF} className="p-2 text-gray-700">
                <Download size={18} />
              </button>

              {/* Settings Button */}

              <button
                onClick={() => setShowSetting((prev) => !prev)}
                className={`rounded-lg p-2 transition-all duration-200 flex items-center justify-center $ showSetting ? "bg-indigo-100 text-indigo-600" : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"}`}
              >
                <Settings size={20} />
              </button>



              <button className="p-2 text-gray-700">
                <HelpCircle size={18} />
              </button>

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white">
                {username ? username[0].toUpperCase() : "A"}
              </div>
            </div>
          </div>
        </div>

        {showSetting && (

          <div className="absolute right-5 top-16 z-50 w-[320px] bg-white rounded-2xl shadow-xl border border-gray-200">

            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">
                Settings
              </h2>

              <X
                size={20}
                className="cursor-pointer text-gray-500"
                onClick={() => setShowSetting(false)}
              />
            </div>

            <div className="p-5 space-y-6">
              <div className="flex items-center justify-between">

                <span className="text-gray-700 font-medium">
                  Auto Save
                </span>

                <label className="relative cursor-pointer">

                  <input
                    type="checkbox"
                    checked={autoSave}
                    onChange={
                      e => setAutoSave(e.target.checked)
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 rounded-full peer-checked:bg-indigo-600 after:absolute after:top-[2px] after:left-[2px] after:w-5 after:h-5 after:bg-white after:rounded-full after:transition-all peer-checked:after:translate-x-5" />
                </label>
              </div>

              <div>
                <label className="text-sm text-gray-600">
                  Height Margin
                </label>

                <div className="flex items-center border rounded-lg mt-2 overflow-hidden">
                  <button
                    onClick={() =>
                      setHeightMargin(
                        Math.max(0, heightMargin - 1)
                      )
                    }
                    className="px-3 py-2 hover:bg-gray-100">
                    -
                  </button>

                  <input
                    type="number"
                    value={heightMargin}
                    onChange={
                      e => setHeightMargin(
                        Number(e.target.value)
                      )
                    }
                    className="w-full text-center outline-none" />
                  <button
                    onClick={() =>
                      setHeightMargin(heightMargin + 1)
                    }
                    className="px-3 py-2 hover:bg-gray-100">
                    +
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-600">
                  Width Margin
                </label>

                <div className="flex items-center border rounded-lg mt-2 overflow-hidden">
                  <button
                    onClick={() =>
                      setWidthMargin(
                        Math.max(0, widthMargin - 1)
                      )
                    }
                    className="px-3 py-2 hover:bg-gray-100">
                    -
                  </button>

                  <input
                    type="number"
                    value={widthMargin}
                    onChange={
                      e => setWidthMargin(
                        Number(e.target.value)
                      )
                    }
                    className="w-full text-center outline-none"
                  />
                  <button onClick={() =>
                    setWidthMargin(widthMargin + 1)
                  }
                    className="px-3 py-2 hover:bg-gray-100">
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </header>

      <div className="border-b bg-gray-50 border-gray-300 px-4 py-3 md:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <h2 className="truncate text-base md:text-xl font-semibold text-gray-900">
            Untitled Document.md
          </h2>

          <div className="flex items-center gap-1 text-xs font-medium text-green-600">
            <span>Saved</span>

            <Pencil size={12} />
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-125px)] overflow-hidden bg-gray-50">
        <section className="relative w-full border-r bg-white md:w-1/2 lg:w-[43%]">
          <textarea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            placeholder="Write Down Here..."
            spellCheck={false}
            className="h-full w-full resize-none border-none bg-white p-6 font-mono text-[15px] leading-8 outline-none"
          />

          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between border-t bg-white px-4 py-3 text-sm text-gray-500">
            <span>
              {words} words • {characters} characters
            </span>

            <div className="flex items-center gap-2">
              <span>Markdown</span>

              <div className="h-2 w-2 rounded-full bg-violet-500" />
            </div>
          </div>
        </section>

        <section
          ref={previewRef}
          className="hidden md:block md:w-1/2 lg:w-[38%] bg-white overflow-y-auto"
        >
          <div className="prose max-w-none p-8">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {markdown}
            </ReactMarkdown>
          </div>
        </section>

        {/* Right Sidebar */}
        <aside className="hidden xl:block w-[280px] border-l border-gray-200 bg-gray-50 p-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
                Advertisement
              </span>

              <span className="rounded bg-gray-100 px-2 py-1 text-[10px] text-gray-500">
                Ad
              </span>
            </div>

            <div className="overflow-hidden rounded-xl bg-gradient-to-br from-violet-100 to-blue-100 p-4">
              <h3 className="text-xl font-bold leading-tight text-gray-900">
                Grow Your
                <span className="block text-violet-600">Business</span>
              </h3>

              <p className="mt-2 text-sm text-gray-600">
                Reach more customers online.
              </p>

              <button className="mt-4 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white">
                Learn More
              </button>

              <div className="mt-4 rounded-lg bg-white p-2">
                <div className="h-24 rounded bg-gray-100" />
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}








// import {
//   Save,
//   Settings,
//   HelpCircle,
//   Upload,
//   Image as ImageIcon,
//   Download,
//   ExternalLink,
//   Pencil,
// } from "lucide-react";

// export default function EditorPage() {
//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <header className="border-b border-gray-400 bg-white">
//         {/* Desktop + iPad */}
//         <div className="hidden md:flex items-center justify-between px-4 lg:px-8 py-3">
//           <h1 className="text-2xl font-semibold tracking-wide text-gray-900">
//             Editor
//           </h1>

//           <div className="flex items-center gap-3 lg:gap-4">
//             {/* Actions */}
//             <div className="flex items-center gap-1 lg:gap-3 text-gray-700">
//               <button className="flex items-center gap-2 rounded-lg p-2 hover:bg-indigo-50 hover:text-indigo-600">
//                 <Save size={20} />
//                 <span className="hidden lg:block">Save</span>
//               </button>

//               <button className="flex items-center gap-2 rounded-lg p-2 hover:bg-indigo-50 hover:text-indigo-600">
//                 <ImageIcon size={20} />
//                 <span className="hidden lg:block">Image</span>
//               </button>

//               <button className="flex items-center gap-2 rounded-lg p-2 hover:bg-indigo-50 hover:text-indigo-600">
//                 <Download size={20} />
//                 <span className="hidden lg:block">Export</span>
//               </button>

//               {/* <button className="rounded-lg p-2 hover:bg-indigo-50 hover:text-indigo-600">
//                 <Eye size={20} />
//               </button> */}

//               {/* <button className="rounded-lg p-2 hover:bg-indigo-50 hover:text-indigo-600">
//                 <ExternalLink size={20} />
//               </button> */}

//               <button className="rounded-lg p-2 hover:bg-indigo-50 hover:text-indigo-600">
//                 <Settings size={20} />
//               </button>

//               <button className="rounded-lg p-2 hover:bg-indigo-50 hover:text-indigo-600">
//                 <HelpCircle size={20} />
//               </button>
//             </div>

//             {/* New Document
//             <button className="rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition">
//               <span className="hidden lg:block px-5 py-3">
//                 + New Document
//               </span>

//               <span className="block lg:hidden px-4 py-3 text-lg font-bold">
//                 +
//               </span>
//             </button> */}

//             {/* Avatar */}
//             <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 font-semibold text-white">
//               A
//             </div>
//           </div>
//         </div>

//         {/* Mobile */}
//         <div className="md:hidden">
//           {/* Top Row */}
//           <div className="flex items-center justify-between px-4 py-3">
//             <h1 className="text-lg font-bold tracking-wide text-gray-900">
//               Editor
//             </h1>

//             <div className="flex items-center gap-2">
//               {/* <button className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-lg font-bold text-white">
//                 +
//               </button> */}

//               <button className="p-2 text-gray-700">
//                 <Save size={18} />
//               </button>

//               <button className="p-2 text-gray-700">
//                 <ImageIcon size={18} />
//               </button>

//               <button className="p-2 text-gray-700">
//                 <Download size={18} />
//               </button>

//               <button className="p-2 text-gray-700">
//                 <Settings size={18} />
//               </button>

//               <button className="p-2 text-gray-700">
//                 <HelpCircle size={18} />
//               </button>

//               <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white">
//                 A
//               </div>
//             </div>
//           </div>

//           {/* Action Row */}
//           {/* <div className="flex items-center justify-between px-3 py-2 border-t">
//             <button className="p-2 text-gray-700">
//               <Upload size={18} />
//             </button>

//             <button className="p-2 text-gray-700">
//               <ImageIcon size={18} />
//             </button>

//             <button className="p-2 text-gray-700">
//               <Download size={18} />
//             </button>
            
//             <button className="p-2 text-gray-700">
//               <Settings size={18} />
//             </button>

//             <button className="p-2 text-gray-700">
//               <HelpCircle size={18} />
//             </button>
//           </div> */}
//         </div>
//       </header>

//       {/* Document Bar */}
//       <div className="border-b bg-gray-50 border-gray-300 px-4 py-3 md:px-6 lg:px-8">
//         <div className="flex items-center gap-3">
//           <h2 className="truncate text-base md:text-xl font-semibold text-gray-900">
//             Untitled Document.md
//           </h2>

//           <div className="flex items-center gap-1 text-xs font-medium text-green-600">
//             <span>Saved</span>
//             <Pencil size={12} />
//           </div>
//         </div>
//       </div>

//       {/* Editor Area */}
//       <div className="flex h-[calc(100vh-125px)] overflow-hidden bg-gray-50">

//         <section className="relative w-full border-r bg-white md:w-1/2 lg:w-[43%]">
//           <textarea
//             spellCheck={false}
//             defaultValue={`# Welcome to Dillinger

// A clean, distraction-free markdown editor. Type on the left,
// see the rendered output on the right.

// ---

// ## Text Formatting

// Markdown makes it easy to format text. You can write in **bold**,
// *italic*, or ~~strikethrough~~.

// ## Lists

// - Import files from GitHub
// - Export to Markdown
// - Drag and drop files

// 1. Write your markdown
// 2. Preview the rendered output
// 3. Export in your preferred format

// ## Code

// \`\`\`javascript
// function greet(name) {
//   console.log("Hello, " + name);
// }
// \`\`\`
// `}
//             className="
//             h-full
//             w-full
//             resize-none
//             border-none
//             bg-white
//             p-6
//             pb-16
//             font-mono
//             text-[15px]
//             leading-8
//             outline-none
//           "
//           />

//           <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between border-t bg-white px-4 py-3 text-sm text-gray-500">
//             <span>387 words • 2507 characters</span>

//             <div className="flex items-center gap-2">
//               <span>Markdown</span>
//               <div className="h-2 w-2 rounded-full bg-violet-500" />
//             </div>
//           </div>
//         </section>

//         {/* Preview */}
//         <section className="hidden md:block md:w-1/2 lg:w-[38%] bg-white overflow-y-auto">
//           <div className="max-w-3xl px-8 py-8">
//             <h1 className="text-3xl font-bold text-slate-900 mb-6">
//               Welcome to Dillinger
//             </h1>

//             <p className="text-slate-700 leading-8 mb-8">
//               A clean, distraction-free markdown editor.
//               Type on the left, see the rendered output on the right.
//             </p>

//             <hr className="mb-8" />

//             <h2 className="text-2xl font-bold mb-4">
//               Text Formatting
//             </h2>

//             <p className="text-slate-700 leading-8 mb-8">
//               Markdown makes it easy to format text.
//               You can write in <strong>bold</strong>,
//               <em> italic</em>,
//               or <span className="line-through">strikethrough</span>.
//               Use <code className="rounded bg-slate-100 px-1">inline code</code>.
//             </p>

//             <h2 className="text-2xl font-bold mb-4">
//               Lists
//             </h2>

//             <ul className="list-disc pl-6 space-y-2 text-slate-700 mb-8">
//               <li>Import files from GitHub, Dropbox, or Google Drive</li>
//               <li>Export to Markdown, HTML, or PDF</li>
//               <li>Drag and drop files directly into the editor</li>
//             </ul>

//             <ol className="list-decimal pl-6 space-y-2 text-slate-700 mb-8">
//               <li>Write your markdown</li>
//               <li>Preview the rendered output</li>
//               <li>Export in your preferred format</li>
//             </ol>

//             <h2 className="text-2xl font-bold mb-4">
//               Code
//             </h2>

//             <p className="text-slate-700 mb-4">
//               You can also add code blocks with syntax highlighting:
//             </p>

//             <div className="overflow-hidden rounded-xl bg-slate-900">
//               <pre className="p-5 text-sm text-green-300">
//                 {`function greet(name) {console.log('Hello, ${name}!');
//                 }`}
//               </pre>
//             </div>
//           </div>
//         </section>

//         {/* Right Sidebar */}
//         <aside className="hidden xl:block w-[280px] border-l border-gray-200 bg-gray-50 p-4">
//           <div className="rounded-2xl border border-gray-200 bg-white p-4">

//             <div className="mb-3 flex items-center justify-between">
//               <span className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
//                 Advertisement
//               </span>

//               <span className="rounded bg-gray-100 px-2 py-1 text-[10px] text-gray-500">
//                 Ad
//               </span>
//             </div>

//             <div className="overflow-hidden rounded-xl bg-gradient-to-br from-violet-100 to-blue-100 p-4">
//               <h3 className="text-xl font-bold leading-tight text-gray-900">
//                 Grow Your
//                 <span className="block text-violet-600">
//                   Business
//                 </span>
//               </h3>

//               <p className="mt-2 text-sm text-gray-600">
//                 Reach more customers online.
//               </p>

//               <button className="mt-4 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white">
//                 Learn More
//               </button>

//               <div className="mt-4 rounded-lg bg-white p-2">
//                 <div className="h-24 rounded bg-gray-100" />
//               </div>
//             </div>
//           </div>
//         </aside>
//       </div>
//     </div>
//   );
// }

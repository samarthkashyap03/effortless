import { useState, useCallback } from "react";
import {
    EditorContent,
    useEditor,
    type Editor as EditorInstance,
} from "@tiptap/react";
import { useRef, useEffect } from "react";
import { BubbleMenu, FloatingMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Highlight from "@tiptap/extension-highlight";
import Typography from "@tiptap/extension-typography";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import BubbleMenuExtension from "@tiptap/extension-bubble-menu";
import FloatingMenuExtension from "@tiptap/extension-floating-menu";
import { motion, AnimatePresence } from "framer-motion";
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    Strikethrough,
    Code,
    Heading1,
    Heading2,
    Heading3,
    List,
    ListOrdered,
    Quote,
    CheckSquare,
    Link as LinkIcon,
    Highlighter,
    Undo,
    Redo,
    Image as ImageIcon,
    Plus,
    Type,
    Minus,
    AlignLeft,
    ChevronDown,
} from "lucide-react";
import "./editor.css";

// Slash Command Menu Item
interface CommandItem {
    title: string;
    description: string;
    icon: React.ReactNode;
    command: (editor: EditorInstance) => void;
}

const SLASH_COMMANDS: CommandItem[] = [
    {
        title: "Heading 1",
        description: "Large section heading",
        icon: <Heading1 className="w-5 h-5" />,
        command: (editor) => editor.chain().focus().toggleHeading({ level: 1 }).run(),
    },
    {
        title: "Heading 2",
        description: "Medium section heading",
        icon: <Heading2 className="w-5 h-5" />,
        command: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
        title: "Heading 3",
        description: "Small section heading",
        icon: <Heading3 className="w-5 h-5" />,
        command: (editor) => editor.chain().focus().toggleHeading({ level: 3 }).run(),
    },
    {
        title: "Bold",
        description: "Make text bold",
        icon: <Bold className="w-5 h-5" />,
        command: (editor) => editor.chain().focus().toggleBold().run(),
    },
    {
        title: "Underline",
        description: "Underline text",
        icon: <UnderlineIcon className="w-5 h-5" />,
        command: (editor) => editor.chain().focus().toggleUnderline().run(),
    },
    {
        title: "Bullet List",
        description: "Create a simple bulleted list",
        icon: <List className="w-5 h-5" />,
        command: (editor) => editor.chain().focus().toggleBulletList().run(),
    },
    {
        title: "Numbered List",
        description: "Create a numbered list",
        icon: <ListOrdered className="w-5 h-5" />,
        command: (editor) => editor.chain().focus().toggleOrderedList().run(),
    },
    {
        title: "To-do List",
        description: "Track tasks with checkboxes",
        icon: <CheckSquare className="w-5 h-5" />,
        command: (editor) => editor.chain().focus().toggleTaskList().run(),
    },
    {
        title: "Quote",
        description: "Capture a quote",
        icon: <Quote className="w-5 h-5" />,
        command: (editor) => editor.chain().focus().toggleBlockquote().run(),
    },
    {
        title: "Divider",
        description: "Visual divider",
        icon: <Minus className="w-5 h-5" />,
        command: (editor) => editor.chain().focus().setHorizontalRule().run(),
    },
    {
        title: "Code Block",
        description: "Display code with syntax",
        icon: <Code className="w-5 h-5" />,
        command: (editor) => editor.chain().focus().toggleCodeBlock().run(),
    },
];

// Toolbar button component
const ToolbarButton = ({
    onClick,
    isActive,
    disabled,
    children,
    tooltip,
    className,
}: {
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
    tooltip?: string;
    className?: string;
}) => (
    <button
        onClick={onClick}
        disabled={disabled}
        title={tooltip}
        className={`
            p-2 rounded-lg transition-all duration-200 relative group
            ${isActive
                ? "bg-zinc-200 text-zinc-900 shadow-sm"
                : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100"
            }
            ${disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}
            ${className || ""}
        `}
    >
        {children}
    </button>
);

interface EditorProps {
    content: string;
    onChange: (content: string) => void;
    editable?: boolean;
    onTransaction?: (transaction: any) => void;
    fontFamily?: string;
    onFontChange?: (font: string) => void;
    fontSize?: string;
    onFontSizeChange?: (size: string) => void;
    onPaste?: () => void;
}


const FONT_OPTIONS = [
    { name: "Arial", value: "Arial, sans-serif" },
    { name: "Times New Roman", value: "'Times New Roman', serif" },
    { name: "Calibri", value: "Calibri, sans-serif" },
    { name: "Courier", value: "'Courier New', monospace" },
    { name: "Inter", value: "Inter, sans-serif" },
];

const SIZE_OPTIONS = [
    { name: "Small", value: "15px" },
    { name: "Medium", value: "17px" },
    { name: "Large", value: "19px" },
    { name: "Extra Large", value: "21px" },
];

export default function Editor({ content, onChange, editable = true, onTransaction, fontFamily, onFontChange, fontSize, onFontSizeChange, onPaste }: EditorProps) {

    const [showSlashMenu, _setShowSlashMenu] = useState(false);
    const [slashMenuQuery, _setSlashMenuQuery] = useState("");
    const [selectedCommandIndex, _setSelectedCommandIndex] = useState(0);
    const [isFontMenuOpen, setIsFontMenuOpen] = useState(false);
    const [isSizeMenuOpen, setIsSizeMenuOpen] = useState(false);


    // Refs to keep track of state inside the non-updating editor callbacks
    const slashMenuState = useRef({
        isOpen: false,
        query: "",
        index: 0
    });

    const setShowSlashMenu = (val: boolean) => {
        _setShowSlashMenu(val);
        slashMenuState.current.isOpen = val;
    };
    const setSlashMenuQuery = (val: string) => {
        _setSlashMenuQuery(val);
        slashMenuState.current.query = val;
    };
    const setSelectedCommandIndex = (val: number | ((prev: number) => number)) => {
        if (typeof val === 'function') {
            _setSelectedCommandIndex(prev => {
                const newIdx = val(prev);
                slashMenuState.current.index = newIdx;
                return newIdx;
            });
        } else {
            _setSelectedCommandIndex(val);
            slashMenuState.current.index = val;
        }
    };

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2, 3] },
            }),
            Placeholder.configure({
                placeholder: ({ node }) => {
                    if (node.type.name === 'heading') {
                        return 'Heading';
                    }
                    return "Type '/' for commands, or just start writing...";
                },
                emptyEditorClass: "is-editor-empty",
            }),
            Image.configure({
                inline: true,
                allowBase64: true,
            }),
            TaskList,
            TaskItem.configure({
                nested: true,
            }),
            Highlight.configure({
                multicolor: true,
            }),
            Underline,
            Typography,
            Link.configure({
                openOnClick: false,
                autolink: true,
            }),
            BubbleMenuExtension,
            FloatingMenuExtension,
        ],
        content,
        editable,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        onTransaction: ({ transaction }) => {
            if (onTransaction) {
                onTransaction(transaction);
            }
        },
        editorProps: {
            attributes: {
                class: "focus:outline-none max-w-none w-full mx-auto h-full",
            },
            handleKeyDown: (view, event) => {
                const { isOpen, index, query } = slashMenuState.current;

                if (event.key === "/" && !isOpen) {
                    setShowSlashMenu(true);
                    setSlashMenuQuery("");
                    setSelectedCommandIndex(0);
                    // Allow the / to be typed
                    return false;
                }

                if (isOpen) {
                    if (event.key === "Escape") {
                        setShowSlashMenu(false);
                        return true;
                    }

                    const filtered = SLASH_COMMANDS.filter(cmd =>
                        cmd.title.toLowerCase().includes(query.toLowerCase()) ||
                        cmd.description.toLowerCase().includes(query.toLowerCase())
                    );

                    if (event.key === "ArrowDown") {
                        event.preventDefault();
                        setSelectedCommandIndex((prev) =>
                            Math.min(prev + 1, filtered.length - 1)
                        );
                        return true;
                    }
                    if (event.key === "ArrowUp") {
                        event.preventDefault();
                        setSelectedCommandIndex((prev) => Math.max(prev - 1, 0));
                        return true;
                    }
                    if (event.key === "Enter") {
                        event.preventDefault();
                        const command = filtered[index];
                        if (command) {
                            executeCommandRef.current?.(index, filtered);
                        }
                        return true;
                    }
                    if (event.key === "Backspace") {
                        if (query === "") {
                            setShowSlashMenu(false);
                            return false; // let backspace delete the /
                        }
                    }
                }
                return false;
            },
            handleTextInput: (view, from, to, text) => {
                if (slashMenuState.current.isOpen) {
                    // Ignore the initial '/' trigger so it doesn't break search
                    if (text === "/" && slashMenuState.current.query === "") {
                        return false;
                    }
                    // Update query
                    const newQuery = slashMenuState.current.query + text;
                    setSlashMenuQuery(newQuery);
                    setSelectedCommandIndex(0);
                    // We don't prevent input, we just track it
                }
                return false;
            },
            handlePaste: (view, event, slice) => {
                if (onPaste) onPaste();
                return false;
            },
        },
    });

    // Ref to hold the execute function to avoid stale closure issues in handleKeyDown
    const executeCommandRef = useRef<((index: number, commands: CommandItem[]) => void) | null>(null);

    const filteredCommands = SLASH_COMMANDS.filter(
        (cmd) =>
            cmd.title.toLowerCase().includes(slashMenuQuery.toLowerCase()) ||
            cmd.description.toLowerCase().includes(slashMenuQuery.toLowerCase())
    );

    const executeCommand = useCallback(
        (index: number, commands: CommandItem[] = filteredCommands) => {
            if (!editor) return;
            const command = commands[index];
            if (command) {
                const { from } = editor.state.selection;
                // Calculate length to delete: query length + 1 for the slash
                const queryLen = slashMenuQuery.length;

                editor
                    .chain()
                    .focus()
                    .deleteRange({ from: from - queryLen - 1, to: from })
                    .run();

                command.command(editor);
            }
            setShowSlashMenu(false);
            setSlashMenuQuery("");
        },
        [editor, filteredCommands, slashMenuQuery]
    );

    // update ref
    useEffect(() => {
        executeCommandRef.current = executeCommand;
    }, [executeCommand]);

    const setLink = useCallback(() => {
        if (!editor) return;
        const previousUrl = editor.getAttributes("link").href;
        const url = window.prompt("URL", previousUrl);
        if (url === null) return;
        if (url === "") {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
            return;
        }
        editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    }, [editor]);

    const addImage = useCallback(() => {
        if (!editor) return;
        const url = window.prompt("Image URL");
        if (url) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    }, [editor]);

    if (!editor) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-zinc-300 border-t-zinc-600 rounded-full animate-spin" />
            </div>
        );
    }

    // Find current font name
    const currentFontName = FONT_OPTIONS.find(f => f.value === fontFamily)?.name || "Font";
    const currentSizeName = SIZE_OPTIONS.find(s => s.value === fontSize)?.name || "Size";

    return (
        <div className="relative w-full flex flex-col min-h-full">
            {/* Clean Minimal Toolbar - Compact Spacing */}
            <div className="flex items-center gap-0.5 px-3 py-2 border-b border-zinc-200 bg-white sticky top-0 z-40 overflow-x-auto toolbar-scrollbar">
                {/* Undo/Redo */}
                <div className="flex items-center gap-0.5 pr-2 mr-2 border-r border-zinc-200">
                    <ToolbarButton
                        onClick={() => editor.chain().focus().undo().run()}
                        disabled={!editor.can().chain().focus().undo().run()}
                        tooltip="Undo"
                    >
                        <Undo className="w-4 h-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().redo().run()}
                        disabled={!editor.can().chain().focus().redo().run()}
                        tooltip="Redo"
                    >
                        <Redo className="w-4 h-4" />
                    </ToolbarButton>
                </div>

                {/* Font & Size Selector */}
                {(onFontChange || onFontSizeChange) && (
                    <div className="flex items-center gap-1 pr-2 mr-2 border-r border-zinc-200">
                        {onFontChange && (
                            <div className="relative">
                                <button
                                    onClick={() => setIsFontMenuOpen(!isFontMenuOpen)}
                                    className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-sm font-medium text-zinc-700 hover:bg-zinc-100 transition-colors w-28 border border-zinc-200"
                                >
                                    <span className="truncate flex-1 text-left">{currentFontName}</span>
                                    <ChevronDown className="w-3 h-3 text-zinc-400" />
                                </button>

                                <AnimatePresence>
                                    {isFontMenuOpen && (
                                        <>
                                            <div
                                                className="fixed inset-0 z-30"
                                                onClick={() => setIsFontMenuOpen(false)}
                                            />
                                            <motion.div
                                                initial={{ opacity: 0, y: 5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 5 }}
                                                className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-xl border border-zinc-100 p-1 z-40"
                                            >
                                                {FONT_OPTIONS.map((font) => (
                                                    <button
                                                        key={font.name}
                                                        onClick={() => {
                                                            onFontChange(font.value);
                                                            setIsFontMenuOpen(false);
                                                        }}
                                                        className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center justify-between
                                                            ${fontFamily === font.value ? "bg-zinc-100 text-zinc-900 font-medium" : "text-zinc-600 hover:bg-zinc-50"}
                                                        `}
                                                        style={{ fontFamily: font.value }}
                                                    >
                                                        {font.name}
                                                    </button>
                                                ))}
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}

                        {onFontSizeChange && (
                            <div className="relative">
                                <button
                                    onClick={() => setIsSizeMenuOpen(!isSizeMenuOpen)}
                                    className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-sm font-medium text-zinc-700 hover:bg-zinc-100 transition-colors w-20 border border-zinc-200"
                                >
                                    <span className="truncate flex-1 text-left">{currentSizeName}</span>
                                    <ChevronDown className="w-3 h-3 text-zinc-400" />
                                </button>

                                <AnimatePresence>
                                    {isSizeMenuOpen && (
                                        <>
                                            <div
                                                className="fixed inset-0 z-30"
                                                onClick={() => setIsSizeMenuOpen(false)}
                                            />
                                            <motion.div
                                                initial={{ opacity: 0, y: 5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 5 }}
                                                className="absolute top-full left-0 mt-1 w-32 bg-white rounded-lg shadow-xl border border-zinc-100 p-1 z-40"
                                            >
                                                {SIZE_OPTIONS.map((size) => (
                                                    <button
                                                        key={size.name}
                                                        onClick={() => {
                                                            onFontSizeChange(size.value);
                                                            setIsSizeMenuOpen(false);
                                                        }}
                                                        className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center justify-between
                                                            ${fontSize === size.value ? "bg-zinc-100 text-zinc-900 font-medium" : "text-zinc-600 hover:bg-zinc-50"}
                                                        `}
                                                    >
                                                        {size.name}
                                                    </button>
                                                ))}
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                )}

                {/* Text Styles */}
                <div className="flex items-center gap-0.5 pr-2 mr-2 border-r border-zinc-200">
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                        isActive={editor.isActive("heading", { level: 1 })}
                        tooltip="Heading 1"
                    >
                        <span className="text-xs font-bold w-4 h-4 flex items-center justify-center">H1</span>
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        isActive={editor.isActive("heading", { level: 2 })}
                        tooltip="Heading 2"
                    >
                        <span className="text-xs font-bold w-4 h-4 flex items-center justify-center">H2</span>
                    </ToolbarButton>
                </div>

                {/* Formatting */}
                <div className="flex items-center gap-0.5 pr-2 mr-2 border-r border-zinc-200">
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        isActive={editor.isActive("bold")}
                        tooltip="Bold"
                    >
                        <Bold className="w-4 h-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        isActive={editor.isActive("italic")}
                        tooltip="Italic"
                    >
                        <Italic className="w-4 h-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleUnderline().run()}
                        isActive={editor.isActive("underline")}
                        tooltip="Underline"
                    >
                        <UnderlineIcon className="w-4 h-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                        isActive={editor.isActive("strike")}
                        tooltip="Strikethrough"
                    >
                        <Strikethrough className="w-4 h-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleHighlight().run()}
                        isActive={editor.isActive("highlight")}
                        tooltip="Highlight"
                    >
                        <Highlighter className="w-4 h-4" />
                    </ToolbarButton>
                </div>

                {/* Lists & Blocks */}
                <div className="flex items-center gap-0.5 pr-2 mr-2 border-r border-zinc-200">
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        isActive={editor.isActive("bulletList")}
                        tooltip="Bullet List"
                    >
                        <List className="w-4 h-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        isActive={editor.isActive("orderedList")}
                        tooltip="Numbered List"
                    >
                        <ListOrdered className="w-4 h-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                        isActive={editor.isActive("blockquote")}
                        tooltip="Quote"
                    >
                        <Quote className="w-4 h-4" />
                    </ToolbarButton>
                </div>

                {/* Insert */}
                <div className="flex items-center gap-0.5">
                    <ToolbarButton onClick={addImage} tooltip="Insert Image">
                        <ImageIcon className="w-4 h-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={setLink}
                        isActive={editor.isActive("link")}
                        tooltip="Insert Link"
                    >
                        <LinkIcon className="w-4 h-4" />
                    </ToolbarButton>
                </div>
            </div>

            {/* Bubble Menu - Appears on Selection */}
            <BubbleMenu
                className="flex items-center gap-1 p-1.5 rounded-xl bg-zinc-900 shadow-2xl border border-zinc-700"
                editor={editor}
            >
                <button
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`p-2 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800 transition-all ${editor.isActive("bold") ? "bg-zinc-700 text-white" : ""}`}
                >
                    <Bold className="w-4 h-4" />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`p-2 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800 transition-all ${editor.isActive("italic") ? "bg-zinc-700 text-white" : ""}`}
                >
                    <Italic className="w-4 h-4" />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    className={`p-2 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800 transition-all ${editor.isActive("underline") ? "bg-zinc-700 text-white" : ""}`}
                >
                    <UnderlineIcon className="w-4 h-4" />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    className={`p-2 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800 transition-all ${editor.isActive("strike") ? "bg-zinc-700 text-white" : ""}`}
                >
                    <Strikethrough className="w-4 h-4" />
                </button>
                <div className="w-px h-5 bg-zinc-700 mx-1" />
                <button
                    onClick={setLink}
                    className={`p-2 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800 transition-all ${editor.isActive("link") ? "bg-zinc-700 text-white" : ""}`}
                >
                    <LinkIcon className="w-4 h-4" />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleHighlight().run()}
                    className={`p-2 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800 transition-all ${editor.isActive("highlight") ? "bg-zinc-700 text-white" : ""}`}
                >
                    <Highlighter className="w-4 h-4" />
                </button>
            </BubbleMenu>

            {/* Floating Menu - Shows on empty lines */}
            <FloatingMenu
                className="flex items-center gap-2"
                editor={editor}
            >
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-1 p-1 rounded-lg bg-zinc-50 border border-zinc-200 shadow-sm"
                >
                    <button
                        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                        className="p-1.5 rounded text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-all"
                        title="Heading"
                    >
                        <Type className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        className="p-1.5 rounded text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-all"
                        title="List"
                    >
                        <List className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleTaskList().run()}
                        className="p-1.5 rounded text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-all"
                        title="To-do"
                    >
                        <CheckSquare className="w-4 h-4" />
                    </button>
                    <button
                        onClick={addImage}
                        className="p-1.5 rounded text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-all"
                        title="Image"
                    >
                        <ImageIcon className="w-4 h-4" />
                    </button>
                </motion.div>
            </FloatingMenu>

            {/* Slash Command Menu */}
            <AnimatePresence>
                {showSlashMenu && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute left-12 top-20 z-50 w-72 bg-white rounded-xl shadow-2xl border border-zinc-200 overflow-hidden"
                    >
                        <div className="p-2 border-b border-zinc-100">
                            <div className="flex items-center gap-2 px-2 py-1 text-xs text-zinc-400">
                                <AlignLeft className="w-3 h-3" />
                                <span>Basic blocks</span>
                            </div>
                        </div>
                        <div className="max-h-80 overflow-y-auto p-1">
                            {filteredCommands.length === 0 ? (
                                <div className="px-3 py-4 text-center text-zinc-400 text-sm">
                                    No results found
                                </div>
                            ) : (
                                filteredCommands.map((cmd, index) => (
                                    <button
                                        key={cmd.title}
                                        onClick={() => executeCommand(index)}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${index === selectedCommandIndex
                                            ? "bg-zinc-100"
                                            : "hover:bg-zinc-50"
                                            }`}
                                    >
                                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white border border-zinc-200 flex items-center justify-center text-zinc-500">
                                            {cmd.icon}
                                        </div>
                                        <div>
                                            <div className="font-medium text-zinc-900 text-sm">{cmd.title}</div>
                                            <div className="text-xs text-zinc-400">{cmd.description}</div>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Editor Content */}
            <div id="editor-content" className="flex-1 h-full">
                <EditorContent editor={editor} className="flex-1 h-full" />
            </div>

            {/* Bottom Status Bar */}
            <div className="flex items-center justify-between px-6 py-2 border-t border-zinc-100 bg-zinc-50/80 text-xs text-zinc-400">
                <span>Press '/' for commands</span>
                <span>{editor.storage.characterCount?.words?.() || 0} words</span>
            </div>
        </div>
    );
}

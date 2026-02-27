import styles from "../styles/Note.module.css";
import React, { useState } from "react";
import {
	Layout,
	Card,
	Typography,
	Space,
	Tag,
	Input,
	Button,
	Select,
	InputNumber,
	Divider
} from "antd";
import { Header } from "antd/es/layout/layout";
import { 
	UndoOutlined,
    RedoOutlined,
	BoldOutlined,
	ItalicOutlined,
	UnderlineOutlined,
	StrikethroughOutlined,
} from '@ant-design/icons';

import { useEditor, EditorContent, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { TextStyleKit } from '@tiptap/extension-text-style'

const { Text } = Typography;
const { Content } = Layout;

const headingOptions = [
  { label: "Normal text", value: "normal" },
  { label: "Heading 1", value: "h1" },
  { label: "Heading 2", value: "h2" },
  { label: "Heading 3", value: "h3" },
  { label: "Heading 4", value: "h4" },
  { label: "Heading 5", value: "h5" },
  { label: "Heading 6", value: "h6" },
];

const Note: React.FC = () => {
	const editor = useEditor({
		extensions: [StarterKit, Underline, TextStyleKit],
		content: "<p>Hello world, empty paragraph</p>",
		editorProps: {
			handleKeyDown,
			attributes: {
				class: styles.Editor,
				spellcheck: "true",
			},
		},
	});

	const { isBold, isItalic, isUnderline, isStrike, currentHeading, fontSizePx } =
	useEditorState({
		editor,
		selector: ({ editor }) => {
		let currentHeading = "normal";

		for (let i = 1; i <= 6; i++) {
			if (editor.isActive("heading", { level: i })) {
			currentHeading = `h${i}`;
			break;
			}
		}

		const fs = editor.getAttributes("textStyle")?.fontSize;
		const px = typeof fs === "string" ? parseInt(fs, 10) : 16;

		return {
			isBold: editor.isActive("bold"),
			isItalic: editor.isActive("italic"),
			isUnderline: editor.isActive("underline"),
			isStrike: editor.isActive("strike"),
			currentHeading,
			fontSizePx: px
		};
		},
	});

	return (
		<Layout style={{ minHeight: "100vh", background: "#f0f5ff" }}>
			<Header
				style={{
					background: "#ffffff",
					boxShadow: "0 2px 8px rgba(15,35,95,0.08)",
					padding: "8px 24px",
					height: "auto",
				}}
			>
				<Space
					align="start"
					style={{ width: "100%", justifyContent: "space-between", flexWrap: "wrap" }}
				>
					<Space orientation="vertical" size={0}>
						<Input
							defaultValue="Urban Ecology Study"
							placeholder="Note title"
							className={styles.noteTitleInput}
							variant={"borderless"}
							style={{
								padding: "0 8px",
								fontSize: 24,
								fontWeight: 600,
								lineHeight: 1.1,
							}}
						/>
						<div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 0 }}>
							<Tag color="gold">Draft</Tag>
							<Tag color="blue">Shared with 3</Tag>
							<Tag>Updated 11:42 AM</Tag>
						</div>
					</Space>
					<Space wrap>
						<Button>Share</Button>
						<Button>Publish</Button>
						<Button type="primary">Export</Button>
					</Space>
				</Space>
				<Space wrap align="center" style={{ marginTop: 8 }}>
					<Button
						onClick={() => editor.chain().focus().undo().run()}				
					><UndoOutlined /></Button>
					<Button
						onClick={() => editor.chain().focus().redo().run()}
					><RedoOutlined /></Button>
					<Divider orientation="vertical" />
					<Select
						value={currentHeading}
						style={{ width: 160 }}
						options={headingOptions}
						onChange={(value) => handleHeadingChange(value, editor)}
					/>
					<Select
						defaultValue="inter"
						style={{ width: 140 }}
						options={[
							{ label: "Inter", value: "inter" },
							{ label: "Space Grotesk", value: "space" },
							{ label: "Georgia", value: "georgia" },
							{ label: "Times New Roman", value: "times" }
						]}
					/>
					<Divider orientation="vertical" />
					<Space size={2}>
						<Button onClick={() => decrease(fontSizePx, editor)}>-</Button>
						<InputNumber min={8} max={72} value={fontSizePx} 
							onChange={(value) => { 
								editor.commands.setFontSize(`${value}px`);
							}} 
						/>
						<Button onClick={() => increase(fontSizePx, editor)}>+</Button>
					</Space>
					<Divider orientation="vertical" />
					<Button
					type={isBold ? "primary" : "default"}
					onClick={() => editor.chain().focus().toggleBold().run()}
					icon={<BoldOutlined />}
					/>
					<Button
					type={isItalic ? "primary" : "default"}
					onClick={() => editor.chain().focus().toggleItalic().run()}
					icon={<ItalicOutlined />}
					/>
					<Button
					type={isUnderline ? "primary" : "default"}
					onClick={() => editor.chain().focus().toggleUnderline().run()}
					icon={<UnderlineOutlined />}
					/>
					<Button
					type={isStrike ? "primary" : "default"}
					onClick={() => editor.chain().focus().toggleStrike().run()}
					icon={<StrikethroughOutlined />}
					/>
					<Button>Text color</Button>
					<Button>Highlight</Button>
				</Space>
			</Header>
			<Content style={{ padding: "32px", display: "flex", justifyContent: "center", flex: 1}}>
				<EditorContent editor={editor} />
			</Content>
		</Layout>
	);
};

function handleKeyDown(view, event: KeyboardEvent) {
  if (event.key === "Tab") {
    event.preventDefault();

    const { state, dispatch } = view;
    dispatch(
      state.tr.insertText("    ")
    );

    return true;
  }

  return false;
}

function handleHeadingChange(value: string, editor) {
	if (value === "normal") {
		editor.chain().focus().setParagraph().run();
	} else {
		const level = Number(value.replace("h", ""));
		editor.chain().focus().toggleHeading({ level }).run();
	}
};



const increase = (fontSize, editor) => {
  const current = Number(fontSize);
  const next = Math.min(current + 1, 72);
  editor.commands.setFontSize(`${next}px`);
};

const decrease = (fontSize, editor) => {
  const current = Number(fontSize);
  const next = Math.max(current - 1, 8);
  editor.commands.setFontSize(`${next}px`);
};


export default Note;

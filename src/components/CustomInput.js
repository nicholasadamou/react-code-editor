import React from "react";

import Editor from "@monaco-editor/react";

const CustomInput = ({ customInput, setCustomInput, theme }) => (
	<>
		<h1 className='font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 mt-2 mb-2 text-white'>
			Input
		</h1>
		<Editor
			height='27vh'
			width={`100%`}
			language={"Plain Text"}
			value={customInput}
			theme={theme}
			defaultValue='Custom Input'
			onChange={(e) => setCustomInput(e)}
			options={{
				minimap: {
					enabled: false,
				},
				renderLineHighlight: "none",
			}}
		/>
	</>
);

export default CustomInput;

import React, { useEffect, useState } from "react";

import Editor from "@monaco-editor/react";

const OutputWindow = ({ outputDetails, theme }) => {
	const [output, setOutput] = useState("");

	useEffect(() => {
		if (outputDetails) {
			setOutput(getOutput());

			return;
		}

		setOutput("");
	}, [outputDetails]);

	const getOutput = () => {
		let statusId = outputDetails?.status?.id;

		if (statusId === 6) {
			// compilation error
			return atob(outputDetails?.compile_output);
		}

		if (statusId === 3) {
			return atob(outputDetails.stdout);
		}

		if (statusId === 5) {
			return `Time Limit Exceeded`;
		}

		return atob(outputDetails?.stderr);
	};

	return (
		<>
			<h1 className='font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 mt-2 mb-2 text-white'>
				Output
			</h1>
			<Editor
				height='27vh'
				width={`99%`}
				language={"Plain Text"}
				value={output}
				theme={theme}
				defaultValue=''
				options={{
					minimap: {
						enabled: false,
					},
					lineNumbers: "off",
					readOnly: true,
					renderLineHighlight: "none",
				}}
			/>
		</>
	);
};

export default OutputWindow;

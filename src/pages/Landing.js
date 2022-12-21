import React, { useEffect, useState } from "react";

import axios from "axios";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import CodeEditorWindow from "../components/CodeEditorWindow";

import { defineTheme } from "../lib/defineTheme";
import { classnames } from "../utils/general";

import useKeyPress from "../hooks/useKeyPress";

import CustomInput from "../components/CustomInput";
import OutputWindow from "../components/OutputWindow";
import OutputDetails from "../components/OutputDetails";

import ThemeDropdown from "../components/ThemeDropdown";

import LanguagesDropdown from "../components/LanguagesDropdown";
import { languageOptions } from "../constants/languageOptions";

import Footer from "../components/Footer";

const javascriptDefault = `/**
* Problem: Binary Search: Search a sorted array for a target value.
*/

// Time: O(log n)
const binarySearch = (arr, target) => {
 return binarySearchHelper(arr, target, 0, arr.length - 1);
};

const binarySearchHelper = (arr, target, start, end) => {
 if (start > end) {
   return false;
 }

 let mid = Math.floor((start + end) / 2);

 if (arr[mid] === target) {
   return mid;
 }

 if (arr[mid] < target) {
   return binarySearchHelper(arr, target, mid + 1, end);
 }

 if (arr[mid] > target) {
   return binarySearchHelper(arr, target, start, mid - 1);
 }
};

const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const target = 5;

console.log(binarySearch(arr, target));
`;

const Landing = () => {
	const [code, setCode] = useState(javascriptDefault);
	const [customInput, setCustomInput] = useState("");
	const [outputDetails, setOutputDetails] = useState(null);
	const [processing, setProcessing] = useState(null);
	const [theme, setTheme] = useState("cobalt");
	const [language, setLanguage] = useState(languageOptions[0]);

	const enterPress = useKeyPress("Enter");
	const ctrlPress = useKeyPress("Control");

	const onSelectChange = (sl) => {
		console.log("selected Option...", sl);
		setLanguage(sl);
	};

	useEffect(() => {
		if (enterPress && ctrlPress) {
			console.log("enterPress", enterPress);
			console.log("ctrlPress", ctrlPress);
			handleCompile();
		}
	}, [ctrlPress, enterPress, handleCompile]);

	const onChange = (action, data) => {
		switch (action) {
			case "code": {
				setCode(data);
				break;
			}
			default: {
				console.warn("case not handled!", action, data);
			}
		}
	};

	const handleCompile = () => {
		setProcessing(true);
		setOutputDetails(null);

		const formData = {
			language_id: language.id,
			// encode source code in base64
			source_code: btoa(code),
			stdin: btoa(customInput),
		};
		const options = {
			method: "POST",
			url: process.env.REACT_APP_RAPID_API_URL,
			params: { base64_encoded: "true", fields: "*" },
			headers: {
				"content-type": "application/json",
				"Content-Type": "application/json",
				"X-RapidAPI-Host": process.env.REACT_APP_RAPID_API_HOST,
				"X-RapidAPI-Key": process.env.REACT_APP_RAPID_API_KEY,
			},
			data: formData,
		};

		axios
			.request(options)
			.then(function (response) {
				console.log("res.data", response.data);
				const token = response.data.token;
				checkStatus(token);
			})
			.catch((err) => {
				let error = err.response ? err.response.data : err;
				// get error status
				let status = err.response.status;
				console.log("status", status);
				if (status === 429) {
					console.log("too many requests", status);

					showErrorToast(
						`Quota of 100 requests exceeded for the Day! Please read the blog on freeCodeCamp to learn how to setup your own RAPID API Judge0!`,
						10000
					);
				}
				setProcessing(false);
				console.log("catch block...", error);
			});
	};

	const checkStatus = async (token) => {
		const options = {
			method: "GET",
			url: process.env.REACT_APP_RAPID_API_URL + "/" + token,
			params: { base64_encoded: "true", fields: "*" },
			headers: {
				"X-RapidAPI-Host": process.env.REACT_APP_RAPID_API_HOST,
				"X-RapidAPI-Key": process.env.REACT_APP_RAPID_API_KEY,
			},
		};
		try {
			let response = await axios.request(options);
			let statusId = response.data.status?.id;

			// Processed - we have a result
			if (statusId === 1 || statusId === 2) {
				// still processing
				setTimeout(() => {
					checkStatus(token);
				}, 2000);
				return;
			} else {
				setProcessing(false);
				setOutputDetails(response.data);
				showSuccessToast(`Compiled Successfully!`);
				console.log("response.data", response.data);
				return;
			}
		} catch (err) {
			console.log("err", err);
			setProcessing(false);
			showErrorToast();
		}
	};

	function handleClearSubmission() {
		setOutputDetails(null);
	}

	function handleThemeChange(th) {
		const theme = th;
		console.log("theme...", theme);

		if (["light", "vs-dark"].includes(theme.value)) {
			setTheme(theme);
		} else {
			defineTheme(theme.value).then((_) => setTheme(theme));
		}
	}

	useEffect(() => {
		defineTheme("github-dark").then((_) =>
			setTheme({ value: "github-dark", label: "GitHub Dark" })
		);
	}, []);

	const showSuccessToast = (msg) => {
		toast.success(msg || `Compiled Successfully!`, {
			position: "bottom-center",
			autoClose: 1000,
			hideProgressBar: false,
			closeOnClick: true,
			pauseOnHover: true,
			draggable: true,
			progress: undefined,
		});
	};

	const showErrorToast = (msg, timer) => {
		toast.error(msg || `Something went wrong! Please try again.`, {
			position: "bottom-center",
			autoClose: timer ? timer : 1000,
			hideProgressBar: false,
			closeOnClick: true,
			pauseOnHover: true,
			draggable: true,
			progress: undefined,
		});
	};

	return (
		<>
			<ToastContainer
				position='top-right'
				autoClose={2000}
				hideProgressBar={false}
				newestOnTop={false}
				closeOnClick
				rtl={false}
				pauseOnFocusLoss
				draggable
				pauseOnHover
			/>

			<div className='flex flex-row mt-2'>
				<div className='pl-4 pr-2 py-2'>
					<LanguagesDropdown onSelectChange={onSelectChange} />
				</div>
				<div className='px-2 py-2'>
					<ThemeDropdown handleThemeChange={handleThemeChange} theme={theme} />
				</div>
				<div className='px-2 py-2'>
					<button
						onClick={handleCompile}
						disabled={!code}
						className={classnames(
							"z-10 rounded-md px-4 py-2 bg-[#ea4a5a] flex-shrink-0 text-white h-[100%]",
							!code ? "opacity-50 cursor-not-allowed" : ""
						)}
					>
						{processing ? "Processing..." : "Compile and Run"}
					</button>
				</div>
				<div className='px-2 py-2'>
					<button
						onClick={handleClearSubmission}
						disabled={outputDetails === null}
						className={classnames(
							"z-10 rounded-md px-4 py-2 bg-[#ea4a5a] flex-shrink-0 text-white h-[100%]",
							outputDetails === null ? "opacity-50 cursor-not-allowed" : ""
						)}
					>
						Clear Submission
					</button>
				</div>
				<div className='px-2 py-2'>
					{outputDetails && <OutputDetails outputDetails={outputDetails} />}
				</div>
			</div>
			<div className='flex flex-col items-start px-4 py-4'>
				<div className='flex flex-col w-full h-full justify-start items-end'>
					<CodeEditorWindow
						code={code}
						onChange={onChange}
						language={language?.value}
						theme={theme.value}
					/>
				</div>

				<div className='flex flex-row flex-shrink-0 gap-2 w-full'>
					<div className='flex flex-shrink-0 w-[50%] flex-col'>
						<CustomInput
							customInput={customInput}
							setCustomInput={setCustomInput}
							theme={theme.value}
						/>
					</div>
					<div className='flex flex-shrink-0 w-[50%] flex-col'>
						<OutputWindow outputDetails={outputDetails} theme={theme.value} />
					</div>
				</div>
			</div>

			<Footer />
		</>
	);
};
export default Landing;

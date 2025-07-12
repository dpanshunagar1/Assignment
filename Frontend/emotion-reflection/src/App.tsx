import React, { useState } from "react";
import { Send, Brain, AlertCircle, CheckCircle } from "lucide-react";
import "./index.css";

interface EmotionResult {
	emotion: string;
	confidence: number;
}

interface ApiResponse {
	emotion: string;
	confidence: number;
}

const EmotionReflectionTool: React.FC = () => {
	const [inputText, setInputText] = useState<string>("");
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [result, setResult] = useState<EmotionResult | null>(null);
	const [error, setError] = useState<string>("");

	const handleSubmit = async () => {
		if (!inputText.trim()) {
			setError("Please enter your reflection text");
			return;
		}

		setIsLoading(true);
		setError("");
		setResult(null);

		try {
			const response = await fetch("http://localhost:8000/analyze-emotion", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ text: inputText }),
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data: ApiResponse = await response.json();
			setResult(data);
		} catch (err) {
			setError(
				"Failed to analyze emotion. Please check if the backend server is running."
			);
			console.error("Error:", err);
		} finally {
			setIsLoading(false);
		}
	};

	const resetForm = () => {
		setInputText("");
		setResult(null);
		setError("");
	};

	const getEmotionClass = (emotion: string): string => {
		const classes: Record<string, string> = {
			Happy: "emotion-happy",
			Sad: "emotion-sad",
			Anxious: "emotion-anxious",
			Excited: "emotion-excited",
			Angry: "emotion-angry",
			Calm: "emotion-calm",
			Confused: "emotion-confused",
			Confident: "emotion-confident",
		};
		return classes[emotion] || "emotion-neutral";
	};

	return (
		<div className="app-container">
			<div className="content-wrapper">
				{/* Header */}
				<div className="header">
					<div className="icon-container">
						<Brain className="brain-icon" />
					</div>
					<h1 className="title">Emotion Reflection Tool</h1>
					<p className="subtitle">
						Share your thoughts and discover your emotional state
					</p>
				</div>

				{/* Main Form */}
				<div className="form-container">
					<div className="form-content">
						<div className="input-group">
							<label htmlFor="reflection" className="input-label">
								How are you feeling today?
							</label>
							<textarea
								id="reflection"
								value={inputText}
								onChange={(e) => setInputText(e.target.value)}
								placeholder="I feel nervous about my first job interview..."
								className="text-input"
								rows={4}
								disabled={isLoading}
							/>
						</div>

						<button
							onClick={handleSubmit}
							disabled={isLoading || !inputText.trim()}
							className={`submit-button ${isLoading ? "loading" : ""}`}
						>
							{isLoading ? (
								<>
									<div className="spinner"></div>
									<span>Analyzing...</span>
								</>
							) : (
								<>
									<Send className="button-icon" />
									<span>Analyze Emotion</span>
								</>
							)}
						</button>
					</div>
				</div>

				{/* Error State */}
				{error && (
					<div className="error-container">
						<div className="error-content">
							<AlertCircle className="error-icon" />
							<p className="error-message">{error}</p>
						</div>
					</div>
				)}

				{/* Success Result */}
				{result && (
					<div className="result-container">
						<div className="result-header">
							<CheckCircle className="success-icon" />
							<h2 className="result-title">Analysis Complete</h2>
						</div>

						<div className="result-content">
							<div
								className={`emotion-card ${getEmotionClass(result.emotion)}`}
							>
								<div className="emotion-info">
									<span className="emotion-name">{result.emotion}</span>
									<span className="confidence-text">
										{Math.round(result.confidence * 100)}% confident
									</span>
								</div>
							</div>

							<div className="confidence-section">
								<h3 className="confidence-title">Confidence Level</h3>
								<div className="progress-bar">
									<div
										className="progress-fill"
										style={{ width: `${result.confidence * 100}%` }}
									></div>
								</div>
								<p className="confidence-description">
									{result.confidence >= 0.8
										? "High confidence"
										: result.confidence >= 0.6
										? "Medium confidence"
										: "Low confidence"}
								</p>
							</div>
						</div>

						<button onClick={resetForm} className="reset-button">
							Analyze Another Reflection
						</button>
					</div>
				)}

				{/* Footer */}
				<div className="footer">
					<p>Built with React, TypeScript & FastAPI</p>
				</div>
			</div>
		</div>
	);
};

export default EmotionReflectionTool;

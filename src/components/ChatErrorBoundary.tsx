import React from 'react';

interface Props {
    children: React.ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ChatErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        console.error('ChatFlow Error:', error, info);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)] max-w-lg mx-auto text-center gap-6 p-8">
                    <div className="text-6xl">🤖</div>
                    <h2 className="text-2xl font-bold text-gray-900">Glowie hit a snag!</h2>
                    <p className="text-gray-500 text-sm leading-relaxed">
                        The chat interface had a technical problem. This likely means the AI backend
                        isn't connected yet. Try refreshing or switching to Offline Mode.
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={() => this.setState({ hasError: false, error: null })}
                            className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                            Try Again
                        </button>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-5 py-2.5 bg-gray-100 text-gray-600 font-semibold rounded-lg hover:bg-gray-200 transition-colors text-sm"
                        >
                            Refresh Page
                        </button>
                    </div>
                    {this.state.error && (
                        <p className="text-xs text-gray-400 font-mono bg-gray-50 p-3 rounded-lg max-w-sm overflow-auto">
                            {this.state.error.message}
                        </p>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}

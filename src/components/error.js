"use client";

import { useState } from "react";

export default function ErrorToast({ message, hint, details }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!message) return null;

  const isAWSError = message.includes('AWS Access Denied') || message.includes('not authorized');

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <div className={`rounded-lg p-4 shadow-lg ${
        isAWSError ? 'bg-red-50 border border-red-200' : 'bg-orange-50 border border-orange-200'
      }`}>
        <div className="flex items-start">
          <div className={`flex-shrink-0 ${isAWSError ? 'text-red-400' : 'text-orange-400'}`}>
            {isAWSError ? '🚫' : '⚠️'}
          </div>
          <div className="ml-3 flex-1">
            <h3 className={`text-sm font-medium ${
              isAWSError ? 'text-red-800' : 'text-orange-800'
            }`}>
              {message}
            </h3>
            
            {hint && (
              <p className={`mt-1 text-sm ${
                isAWSError ? 'text-red-700' : 'text-orange-700'
              }`}>
                {hint}
              </p>
            )}

            {details && (
              <div className="mt-2">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className={`text-xs underline ${
                    isAWSError ? 'text-red-600 hover:text-red-800' : 'text-orange-600 hover:text-orange-800'
                  }`}
                >
                  {isExpanded ? 'Hide details' : 'Show technical details'}
                </button>
                
                {isExpanded && (
                  <div className={`mt-2 p-2 rounded text-xs font-mono ${
                    isAWSError ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
                  }`}>
                    {details}
                  </div>
                )}
              </div>
            )}

            {isAWSError && (
              <div className="mt-3 p-2 bg-red-100 rounded text-xs text-red-800">
                <strong>Quick Fix:</strong>
                <ul className="mt-1 list-disc list-inside">
                  <li>Check your IAM user permissions</li>
                  <li>Remove any explicit DENY policies for Bedrock</li>
                  <li>Ensure bedrock:InvokeModel and bedrock:InvokeAgent are allowed</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

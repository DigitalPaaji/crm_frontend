import { MessageSquare } from 'lucide-react'
import React from 'react'

const DefaultMessage = () => {
  return (
    <div className='flex-1 flex flex-col items-center justify-center p-8'>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center max-w-sm w-full">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Your Messages</h3>
              <p className="mt-2 text-gray-500 text-sm leading-relaxed">
                Select a conversation from the sidebar to start chatting with your network.
              </p>
            </div>
          </div>
  )
}

export default DefaultMessage
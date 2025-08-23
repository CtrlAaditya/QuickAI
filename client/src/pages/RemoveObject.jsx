import { Scissors, Sparkles } from 'lucide-react'
import React, { useState } from 'react'
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';

// Set the base URL for axios requests from your environment variables
axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const RemoveObject = () => {
    // State to hold the selected image file
    const [input, setInput] = useState('');
    // State to hold the text description of the object to remove
    const [object, setObject] = useState('');
    // State to manage loading status during API calls
    const [loading, setLoading] = useState(false);
    // State to store the URL of the processed image
    const [content, setContent] = useState('');

    // Clerk hook to get authentication token
    const { getToken } = useAuth();

    // Handler for form submission
    const onSubmitHandler = async (e) => {
        e.preventDefault(); // Prevent default form submission behavior
        try {
            setLoading(true); // Set loading to true when starting the process

            // Validate that only a single object name is entered
            if (object.split(' ').length > 1) {
                return toast('Please enter only one object name.');
            }
            
            // Create FormData to send both the image file and object description
            const formData = new FormData();
            formData.append('image', input); // Append the image file
            formData.append('object', object); // Append the object description

            // Make the POST request to your backend API
            const { data } = await axios.post('/api/ai/remove-image-object', formData, {
                headers: {
                    Authorization: `Bearer ${await getToken()}` // Include Clerk authentication token
                }
            });

            // Handle the response from the backend
            if (data.success) {
                setContent(data.content); // Set the processed image URL
                toast.success('Object removed successfully!'); // Show success toast
            } else {
                toast.error(data.message); // Show error message from backend
            }
        } catch (error) {
            console.error("Frontend error removing object:", error); // Log detailed error
            toast.error(error.response?.data?.message || error.message || 'Failed to remove object.'); // Show user-friendly error
        } finally {
            setLoading(false); // Always set loading to false after the process finishes
        }
    };

    return (
        <div className='h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-slate-700'>
            {/* Left Column - Form for user input */}
            <form onSubmit={onSubmitHandler} className='w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200'>
                <div className='flex items-center gap-3'>
                    <Sparkles className='w-6 text-[#4A7AFF]' />
                    <h1 className='text-xl font-semibold'>Object Remover</h1>
                </div>

                <p className='mt-6 text-sm font-medium'>Upload image</p>
                {/* Corrected: This input now correctly updates the 'input' state with the file */}
                <input
                    onChange={(e) => setInput(e.target.files[0])}
                    type="file"
                    accept='image/*'
                    className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300 text-gray-600'
                    required
                />

                <p className='mt-6 text-sm font-medium'>Describe Object name to Remove</p>
                {/* Corrected: This textarea now correctly updates the 'object' state with text and displays its value */}
                <textarea
                    onChange={(e) => setObject(e.target.value)}
                    value={object}
                    rows={4}
                    className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300'
                    placeholder='e.g., Watch or Spoon, only single object name'
                    required
                />
                
                {/* Submit button */}
                <button
                    disabled={loading}
                    className='w-full flex justify-center items-center gap-2
                    bg-gradient-to-r from-[#417DF6] to-[#8E37EB] text-white px-4 py-2 mt-6 text-sm
                    rounded-lg cursor-pointer'
                >
                    {loading ? (
                        <span className='w-4 h-4 my-1 rounded-full border-2
                        border-t-transparent animate-spin'></span>
                    ) : (
                        <Scissors className='w-5'/>
                    )}
                    Remove object
                </button>
            </form>

            {/* Right Column - Display processed image */}
            <div className='w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border 
            border-gray-200 min-h-96'>
                <div className='flex items-center gap-3'>
                    <Scissors className='w-5 h-5 text-[#4A7AFF]' />
                    <h1 className='text-xl font-semibold'>Processed image</h1>
                </div>

                {!content ? (
                    <div className='flex-1 flex justify-center items-center'>
                        <div className='text-sm flex flex-col items-center gap-5
                        text-gray-400'>
                            <Scissors className='w-9 h-9' />
                            <p>Upload an Image and click "Remove object" to get started</p>
                        </div>
                    </div>
                ) : (
                    <img src={content} alt="Processed" className='mt-3 w-full h-full object-contain' />
                )}
            </div>
        </div>
    );
};

export default RemoveObject;
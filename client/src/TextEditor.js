import React, { useEffect, useRef, useCallback } from 'react'
import Quill from "quill";
import "quill/dist/quill.snow.css";


function TextEditor() {
   
   //need to clean up toolbar by wrapping it all in one container. As soon as the #container element is rendered, it will call the wrapperRef callback function and pass the element to the function.
    const wrapperRef = useCallback((wrapper) => {
        //if the element is not yet on our page
        if(wrapper == null) return

        wrapper.innerHTML = ""
        const editor = document.createElement('div')
        wrapper.append(editor)
        new Quill(editor, { theme: "snow"})
    }, [])
    return (
        <div className="container" ref={wrapperRef}>

        </div>
    )
}

export default TextEditor

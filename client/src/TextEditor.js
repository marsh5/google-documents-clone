import React, { useEffect, useRef, useCallback, useState } from 'react';
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { io } from 'socket.io-client';
import { useParams } from 'react-router-dom';

const TOOLBAR_SETTINGS = [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ font: [] }],
    [{ list: "ordered" }, { list: "bullet" }],
    ["bold", "italic", "underline"],
    [{ color: [] }, { background: [] }],
    [{ script: "sub" }, { script: "super" }],
    [{ align: [] }],
    ["image", "blockquote", "code-block"],
    ["clean"],
]

const SAVE_INTERVAL = 2000;

function TextEditor() {
    const { id: documentId } = useParams();
    const [socket, setSocket] = useState()
    const [quill, setQuill] = useState()

    console.log('quil', quill)
    console.log('socket', socket)

    useEffect(() => {
        if(socket == null || quill == null) return;

        const interval = setInterval(() => {
            socket.emit('save-document', quill.getContents())

        }, SAVE_INTERVAL)

        return () => {
            clearInterval(interval)
        }

    }, [socket,quill])


    //have different rooms based on URL
    useEffect(() => {
        if(socket == null || quill == null) return;

        //once automatically deals with cleanup
        socket.once("load-document", document => {
            quill.setContents(document)
            quill.enable()
        })

        //when we call get-document, it sends document to our client. Then load-document gets called
        socket.emit('get-document', documentId)
    },[socket, quill, documentId])


    useEffect(() => {
        const s = io("http://localhost:3001");
        setSocket(s)

        return () => {
            s.disconnect()
        }
    }, [])

    useEffect(() => {
        if(socket == null || quill == null) return

        const handler = (delta) => {
           quill.updateContents(delta)
        }
        socket.on('receive-changes', handler)

        //cleanup function
        return () => {
            socket.off('receive-changes', handler)
        }
    }, [socket, quill])



    useEffect(() => {
        if(socket == null || quill == null) return

        console.log('running')

        const handler = (delta, oldDelta, source) => {
            //check if an actual user made the change
            if(source !== 'user') return
            socket.emit("send-changes", delta)
        }
        quill.on('text-change', handler)

        //cleanup function
        return () => {
            quill.off('text-change', handler)
        }
    }, [socket, quill])
   
   //need to clean up  toolbar by wrapping it all in one container. As soon as the #container element is rendered, it will call the wrapperRef callback function and pass the element to the function.
    const wrapperRef = useCallback((wrapper) => {
        //if the element is not yet on our page
        if(wrapper == null) return

        wrapper.innerHTML = ""
        const editor = document.createElement('div')
        wrapper.append(editor)
        const q = new Quill(editor, { theme: "snow", modules: {
            toolbar: TOOLBAR_SETTINGS 
        }})
        q.disable()
        q.setText('Loading...')
        setQuill(q)
    }, [])
    return (
        <div className="container" ref={wrapperRef}>

        </div>
    )
}

export default TextEditor

import Embed from "@editorjs/embed";
import List from "@editorjs/list";
import Image from "@editorjs/image";
import Header from "@editorjs/header";
import Quote from "@editorjs/quote";
import Marker from "@editorjs/marker";
import InlineCode from "@editorjs/inline-code";

const uploadImageByFile = (e) => {
    const file = e.target.files?.[0];
    if(file){
        const reader = new FileReader();
        reader.onload = (e) => {
            if(reader.readyState === 2){
                return{
                    success:1,
                    file:e.target.result
                }
            }
        };
        reader.readAsDataURL(file);
    }
}

const uploadImageByURL = async (e) => {
    let link = new Promise((resolve,reject)=>{
        try {
            resolve(e);
        } catch (err) {
            reject(err);
        }
    })

    return link.then(url => {
        return {
            success:1,
            file:{url}
        }
    })
}

export const tools = {
  embed: Embed,
  list: {
    class:List,
    inlineToolbar:true,
  },
  image: {
    class:Image,
    config:{
        uploader:{
            uploadByUrl:uploadImageByURL,
            uploadByFile:uploadImageByFile,
        }
    }
  },
  header: {
    class:Header,
    config:{
        placeholder:"Type Heading...",
        levels:[2,3],
        defaultLevel:2
    }
  },
  quote: {
    class:Quote,
    inlineToolbar:true,
  },
  marker: Marker,
  inlineCode: InlineCode,
};

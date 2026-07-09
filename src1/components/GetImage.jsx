import React from 'react'
import emoji1 from "../assets/emoji/1.webp"
import emoji2 from "../assets/emoji/2.webp"
import emoji3 from "../assets/emoji/3.webp"
import emoji4 from "../assets/emoji/4.webp"
import emoji5 from "../assets/emoji/5.webp"
import emoji6 from "../assets/emoji/6.webp"
import emoji7 from "../assets/emoji/7.webp"
import emoji8 from "../assets/emoji/8.webp"
import emoji9 from "../assets/emoji/9.webp"
import emoji10 from "../assets/emoji/10.webp"
import emoji11 from "../assets/emoji/11.webp"
import emoji12 from "../assets/emoji/12.webp"
import emoji13 from "../assets/emoji/13.webp"
import emoji14 from "../assets/emoji/14.webp"
import emoji15 from "../assets/emoji/15.webp"
import emoji16 from "../assets/emoji/16.webp"


const GetImage = ({profile,heigth="h-20"}) => {
  return (
    <>
    <img  src={[
        emoji1, emoji2, emoji3, emoji4, emoji5, emoji6, 
        emoji7, emoji8, emoji9, emoji10, emoji13, emoji14, 
        emoji15, emoji16, emoji11, emoji12
      ].find((_,ind)=>ind+1 == profile)}  className={` ${heigth}`} />
    
    </>
  )
}

export default GetImage
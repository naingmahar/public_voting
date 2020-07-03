import * as React from 'react';
import FsLightbox from 'fslightbox-react';

function CustomLightBox() {
    const [toggler, setToggler] = React.useState(false);
    const [productIndex, setProductIndex] = React.useState(0);
    
    return (
        <>
            <button onClick={ () => setToggler(!toggler) }>
                Toggle Lightbox
            </button>
            <FsLightbox
                toggler={ toggler }
                allow="autoplay"
                sources={["https://s3-ap-southeast-1.amazonaws.com/uploads.judgify.me/uploads/82286/697_7b0f81bdd2b24ba32cb27f6c16e6b900_1571981240608.mp4"]}
                videosPosters={ ['https://s3-ap-southeast-1.amazonaws.com/uploads.judgify.me/uploads/24702/3608_f6cf83978d6a8e7ac57444bb38a540a7_1564041106777.jpg'] }
                types={ ['video'] }
            />
        </>
    );
}


export default CustomLightBox
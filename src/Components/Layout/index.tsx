import Footer from "./Footer";
import Navbar from "./Navbar";





export default function Layout(props: { children: any }) {


    return (
        <>
            <Navbar />
            {props.children}
            <Footer />
        </>
    )
}


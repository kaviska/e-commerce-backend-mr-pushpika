import Footer from '@/components/compoments/Footer';
import Nav from '@/components/compoments/Nav';

export default function PageLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <Nav />
            {children}
            <Footer />
        </>
    );
}

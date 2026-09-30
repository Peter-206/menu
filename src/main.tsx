import React, {useEffect, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {categories, visibleDrinks, type Drink} from './catalog';
import {isPreview} from './availability';
import {useAvailability} from './useAvailability';
import './styles.css';

const pageSize = 6;

function makeSlides(drinks: Drink[]): { category: string; drinks: Drink[] }[] {
    return categories.flatMap((category) => {
        const group = drinks.filter((drink) => drink.category === category);
        const slides = [];
        for (let index = 0; index < group.length; index += pageSize) {
            slides.push({category, drinks: group.slice(index, index + pageSize)});
        }
        return slides;
    });
}

function Menu() {
    const {unavailable, loading, error, refresh} = useAvailability();
    const [slideIndex, setSlideIndex] = useState(0);
    const [paused, setPaused] = useState(false);
    const available = visibleDrinks(unavailable);
    const slides = makeSlides(available);
    const activeSlide = slides[Math.min(slideIndex, slides.length - 1)];

    useEffect(() => {
        if (slideIndex >= slides.length && slides.length > 0) setSlideIndex(0);
    }, [slideIndex, slides.length]);

    useEffect(() => {
        if (paused || slides.length < 2 || loading || error) return;
        const timer = window.setInterval(() => setSlideIndex((index) => (index + 1) % slides.length), 15_000);
        return () => window.clearInterval(timer);
    }, [paused, slides.length, loading, error]);

    function moveSlide(direction: number) {
        setSlideIndex((index) => (index + direction + slides.length) % slides.length);
    }

    if (loading) return <main className="status-page"><span className="eyebrow">The Bar</span><h1>Opening the menu…</h1>
    </main>;
    if (error) return <main className="status-page"><span className="eyebrow">The Bar</span><h1>Menu temporarily
        unavailable</h1><p>Please ask the bartender what’s available.</p>
        <button className="outline-button" onClick={() => void refresh()}>Try again</button>
    </main>;

    return <>
        {isPreview &&
            <div className="preview-banner">Preview mode · ingredient changes are saved in this browser only</div>}
        <main className="menu-shell">
            <header className="menu-header">
                <div className="brand-mark" aria-hidden="true">✦</div>
                <div className="brand-copy"><span className="eyebrow">$12 All you can drink</span><h1>The Bar<span
                    className="brand-period">.</span></h1></div>
            </header>

            <div className="desktop-menu" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
                 onFocusCapture={() => setPaused(true)} onBlurCapture={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
            }}>
                {activeSlide ? <>
                    <div className="slide-heading">
                        <div><span className="eyebrow">The cocktail collection</span><h2>{activeSlide.category}</h2>
                        </div>
                        <span
                            className="slide-count">{String(slideIndex + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}</span>
                    </div>
                    <div className="desktop-drink-grid">{activeSlide.drinks.map((drink) => <article
                        className="desktop-drink" key={drink.id}><span
                        className="drink-number">{String(available.indexOf(drink) + 1).padStart(2, '0')}</span>
                        <div><h3>{drink.name}</h3><p>{drink.description}</p></div>
                    </article>)}</div>
                    <div className="slide-footer"><span>Ask your bartender for a recommendation</span>
                        <div className="slide-controls">
                            <button aria-label="Previous menu page" onClick={() => moveSlide(-1)}>←</button>
                            <div className="slide-dots" aria-label="Menu pages">{slides.map((_, index) => <button
                                key={index} aria-label={`Go to menu page ${index + 1}`}
                                aria-current={index === slideIndex ? 'true' : undefined}
                                onClick={() => setSlideIndex(index)}/>)}</div>
                            <button aria-label="Next menu page" onClick={() => moveSlide(1)}>→</button>
                        </div>
                    </div>
                </> : <div className="empty-menu"><h2>Back soon</h2><p>Ask the bartender what’s available.</p></div>}
            </div>

            <div className="mobile-menu">
                <p className="mobile-intro">Pick something you love. We’ll make it for you.</p>
                <nav className="category-nav" aria-label="Menu sections">{categories.map((category) => <a key={category}
                                                                                                          href={`#${category === 'Real Cocktails' ? 'real-cocktails' : 'college-cocktails'}`}>{category}</a>)}</nav>
                {categories.map((category) => {
                    const group = available.filter((drink) => drink.category === category);
                    return <section className="mobile-section"
                                    id={category === 'Real Cocktails' ? 'real-cocktails' : 'college-cocktails'}
                                    key={category}>
                        <div className="mobile-section-heading"><span className="eyebrow">Explore</span>
                            <h2>{category}</h2></div>
                        {group.length ?
                            <div className="mobile-drink-list">{group.map((drink) => <article className="mobile-drink"
                                                                                              key={drink.id}>
                                <h3>{drink.name}</h3><p>{drink.description}</p></article>)}</div> :
                            <p className="section-empty">Nothing available in this section right now.</p>}</section>;
                })}
                <footer className="mobile-footer">Made to enjoy together <span aria-hidden="true">✦</span></footer>
            </div>
        </main>
    </>;
}

createRoot(document.getElementById('root')!).render(<React.StrictMode><Menu/></React.StrictMode>);

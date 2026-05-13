import { useEffect, useRef } from "react";
import "./YandexRtbBanner.css";

const BLOCK_ID = "R-A-19265736-1";
const CONTAINER_ID = "yandex_rtb_R-A-19265736-1";

/**
 * Рекламный блок Яндекс РТБ (РСЯ).
 * Загрузчик context.js подключается один раз в public/index.html.
 */
export default function YandexRtbBanner() {
    const didQueue = useRef(false);

    useEffect(() => {
        if (didQueue.current) return;
        didQueue.current = true;

        window.yaContextCb = window.yaContextCb || [];
        window.yaContextCb.push(() => {
            try {
                if (window.Ya?.Context?.AdvManager) {
                    window.Ya.Context.AdvManager.render({
                        blockId: BLOCK_ID,
                        renderTo: CONTAINER_ID,
                    });
                }
            } catch (e) {
                console.warn("Yandex RTB render:", e);
            }
        });
    }, []);

    return (
        <div className="yandex-rtb-banner" aria-label="Реклама">
            <div id={CONTAINER_ID} className="yandex-rtb-banner__slot" />
        </div>
    );
}

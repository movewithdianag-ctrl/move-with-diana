import { Link } from "react-router-dom";
import { meta, notFound } from "@/content/content";
import Seo from "@/components/Seo";
import { buttonClasses } from "@/components/ui/button";

export default function NotFound() {
  return (
    <>
      <Seo title={meta.notFound.title} description={meta.notFound.description} path="/404" />
      <section className="flex min-h-[60vh] items-center justify-center px-5 pt-24 text-center">
        <div>
          <p className="eyebrow mb-3">404</p>
          <h1 className="font-display text-4xl font-medium tracking-tight md:text-5xl">
            {notFound.heading}
          </h1>
          <p className="mt-4 text-umber">{notFound.text}</p>
          <Link to="/" className={buttonClasses("primary", "mt-8")}>
            {notFound.cta}
          </Link>
        </div>
      </section>
    </>
  );
}

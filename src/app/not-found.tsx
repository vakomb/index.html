import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-dvh place-items-center px-6">
      <div className="max-w-md text-center">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-neutral-400">Klaida 404</p>
        <h1 className="mt-3 text-[30px] font-semibold tracking-[-0.04em]">Puslapis nerastas</h1>
        <p className="mt-3 text-sm leading-relaxed text-neutral-500">
          Ieškoma prekė gali būti išparduota arba jos neįmanoma pristatyti į Lietuvą. Peržiūrėkite kitus mūsų pasiūlymus.
        </p>
        <Link href="/" className="tap mt-8 inline-flex h-11 items-center rounded-full bg-ink px-6 text-sm font-medium text-white">
          Grįžti į pradžią
        </Link>
      </div>
    </div>
  );
}

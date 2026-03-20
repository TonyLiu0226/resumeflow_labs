This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Run with Docker (no local TeX needed)

If you want PDF generation to work without installing TeX on your machine, run the app in Docker:

```bash
docker compose up --build
```

Then open [http://localhost:2019](http://localhost:2019).

The container includes TeX Live, so `/api/resume/render` can run `pdflatex` out of the box.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Installing TeX
For PDF generation to work on your local machine, you need to install TeX locally. Please use the following commands to do so:

Arch linux:
```
yay -S texlive-installer
sudo /opt/texlive-installer/install-tl
```

This will likely take a while. Too lazy to install? Please run the app using Docker following the instructions above instead.
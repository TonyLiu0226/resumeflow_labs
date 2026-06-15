import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import * as cheerio from 'cheerio';
import { v4 as uuidv4 } from 'uuid';
import { JobListing } from "../../../types/job";

export async function GET(request: NextRequest) {
  try {
    const locationParam = request.nextUrl.searchParams.get("location") || "";
    const datePostedParam = request.nextUrl.searchParams.get("datePosted");
    const keywordsParam = request.nextUrl.searchParams.get("keywords") || "";
    const pageNum = request.nextUrl.searchParams.get('pageNum') || '0';

    if (Number(pageNum) > 990 || Number(pageNum) < 0) {
      throw new Error('Page number is invalid')
    }

    let allJobs: JobListing[] = []

    const query = new URLSearchParams();
    if (keywordsParam) query.append("keywords", keywordsParam);
    if (locationParam) query.append("location", locationParam);

    if (datePostedParam && ["r86400", "r604800", "r2592000"].includes(datePostedParam)) {
      query.append("f_TPR", datePostedParam);
    }

    query.append("trk", "public_jobs_jobs-search-bar_search-submit");
    query.append("position", "1");
    query.append("pageNum", "0");
    query.append("start", pageNum);

    const url = `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?${query.toString()}`;
    console.log(url)

    await axios(url).then(response => {
      const html = response.data;
      const data = cheerio.load(html);
      const jobs = data('li')
      jobs.each((index, element) => {
        const jobTitle = data(element).find('h3.base-search-card__title').text().trim()
        const company = data(element).find('h4.base-search-card__subtitle').text().trim()
        const location = data(element).find('span.job-search-card__location').text().trim()
        
        // Try to get standard datetime from <time datetime="..."> attribute first
        let postedDate = data(element).find('time.job-search-card__listdate').attr('datetime');
        if (!postedDate) {
          // Fallback to text if missing
          postedDate = data(element).find('span.job-search-card__listdate').text().trim() || new Date().toISOString();
        }
        
        const link = data(element).find('a.base-card__full-link').attr('href')
        
        allJobs.push({
          'id': uuidv4(),
          'company': company,
          'jobTitle': jobTitle,
          'location': location,
          'description': '',
          'applyUrl': link || '',
          'postedDate': postedDate,
        })
      })
    })
    return NextResponse.json(allJobs);
  } catch (error) {
    console.error("Error fetching job listings:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

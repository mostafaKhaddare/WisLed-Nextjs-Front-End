import { Metadata } from 'next'

import { getAboutUs, getExploreBlogData } from '@lib/data/fetch'
import { BasicContentSection } from '@modules/content/components/basic-content-section'
import { FramedTextSection } from '@modules/content/components/framed-text-section'
import { NumericalSection } from '@modules/content/components/numerical-section'
import { ExploreBlog } from '@modules/home/components/explore-blog'

export const metadata: Metadata = {
  title: 'À propos de Wisled | Solutions d’Éclairage Innovantes',
  description:
    'Découvrez Wisled, votre expert en technologie LED et systèmes de contrôle. Nous concevons des solutions d’éclairage innovantes et de haute qualité adaptées à vos besoins professionnels.',
}

export default async function AboutUsPage() {
  const {
    data: {OurStory, WhyUs, OurCraftsmanship, Numbers },
  } = await getAboutUs()

  const { data: posts } = await getExploreBlogData()

  return (
    <>
      {OurStory && <BasicContentSection data={OurStory} />}
      {WhyUs && <FramedTextSection data={WhyUs} />}
      {OurCraftsmanship && <BasicContentSection data={OurCraftsmanship} />}
      {Numbers && <NumericalSection data={Numbers} />}
      <ExploreBlog posts={posts} />
    </>
  )
}
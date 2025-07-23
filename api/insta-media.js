import axios from 'axios';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { url } = req.query;

    if (!url) {
        return res.status(400).json({ error: 'Missing Instagram URL' });
    }

    try {
        const { data } = await axios.request({
            method: 'GET',
            url: 'https://instagram-scraper-api2.p.rapidapi.com/v1/post_info',
            params: {
                code_or_id_or_url: url,
            },
            headers: {
                'x-rapidapi-key': process.env.INSTAGRAM_API_KEY,
                'x-rapidapi-host': 'instagram-scraper-api2.p.rapidapi.com',
            },
        });

        if (!data || !data.data || !data.data.video_url) {
            return res.status(404).json({ error: 'Media not found in response' });
        }

        const media = data.data.video_url;

        // console.log(media)
        return res.status(200).json({
            success: true, data: {
                title: data.data.caption.text || 'Instagram Video',
                thumbnail: data.data.image_versions.items[0].url || '',
                media: media,
            }
        });

    } catch (error) {
        console.error('Download error:', error.message);
        return res
            .status(500)
            .json({ error: 'Something went wrong', details: error.message });
    }
}

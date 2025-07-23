import axios from 'axios';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { url } = req.query;

    if (!url) {
        return res.status(400).json({ error: 'Missing Instagram URL' });
    }

    function extractYouTubeId(url) {
        const regex = /(?:youtu\.be\/|youtube\.com\/(?:shorts\/|watch\?v=|embed\/|v\/))([\w-]{11})/;
        const match = url.match(regex);
        return match ? match[1] : null;
    }


    try {

        const videoId = extractYouTubeId(url);

        const options = {
            method: 'GET',
            url: process.env.YT_API_URL,
            params: {
                id: videoId,
                cgeo: 'IN',
            },
            headers: {
                'x-rapidapi-key': process.env.YOUTUBE_API_KEY,
                'x-rapidapi-host': 'yt-api.p.rapidapi.com'
            }
        };

        const { data } = await axios.request(options);

        if (!data.status || data.status !== 'OK') {
            return res.status(404).json({ error: 'Media not found in response' });
        }

        // console.log(data.adaptiveFormats)

        // const media = getWorkingVideoFormats(data.formats || data.adaptiveFormats || []);
        const media = data.adaptiveFormats?.find(format => format.itag === 140) || [];

        // console.log(media)
        return res.status(200).json({ success: true, media });

    } catch (error) {
        console.error('Download error:', error.message);
        return res
            .status(500)
            .json({ error: 'Something went wrong', details: error.message });
    }
}

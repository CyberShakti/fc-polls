import type { NextApiRequest, NextApiResponse } from 'next';
import sharp from 'sharp';
import {Poll} from "@/app/types";
import {kv} from "@vercel/kv";
import satori from "satori";
import { join } from 'path';
import * as fs from "fs";

const fontPath = join(process.cwd(), 'Roboto-Regular.ttf')
let fontData = fs.readFileSync(fontPath)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const pollId = req.query['id']
        // const fid = parseInt(req.query['fid']?.toString() || '')
        if (!pollId) {
            return res.status(400).send('Missing poll ID');
        }

        let poll: Poll | null = await kv.hgetall(`poll:${pollId}`);


        if (!poll) {
            return res.status(400).send('Missing poll ID');
        }

        const showResults = req.query['results'] === 'true'
        // let votedOption: number | null = null
        // if (showResults && fid > 0) {
        //     votedOption = await kv.hget(`poll:${pollId}:votes`, `${fid}`) as number
        // }

        const pollOptions = [poll.option1, poll.option2, poll.option3, poll.option4]
            .filter((option) => option !== '');
        const totalVotes = pollOptions
            // @ts-ignore
            .map((option, index) => parseInt(poll[`votes${index+1}`]))
            .reduce((a, b) => a + b, 0);
        const pollData = {
            question: showResults ? `Results for ${poll.title}` : poll.title,
            options: pollOptions
                .map((option, index) => {
                    // @ts-ignore
                    const votes = poll[`votes${index+1}`]
                    const percentOfTotal = totalVotes ? Math.round(votes / totalVotes * 100) : 0;
                    let text = showResults ? `${percentOfTotal}%: ${option} (${votes} votes)` : `${index + 1}. ${option}`
                    return { option, votes, text, percentOfTotal }
                })
        };

        
        // Set the content type to PNG and send the response
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Cache-Control', 'max-age=10');
        res.send(https://cdn.discordapp.com/attachments/1109447762799513600/1201479837605449768/cybershakti_Idli_and_wada_breakfast_1804dc87-f3b2-4e86-a234-3ff9c9f6ddd7.png?ex=65c9f84b&is=65b7834b&hm=de88f46b0dd2934dc42298482300813b3d7eaaecf68399634cfba871abebadf5&);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error generating image');
    }
}

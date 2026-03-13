'use server'

import fs from 'fs'
import path from 'path'

export async function getProjects() {
    const projectsPath = path.join(process.cwd(), 'projects.json')
    if (!fs.existsSync(projectsPath)) {
        return []
    }
    try {
        return JSON.parse(fs.readFileSync(projectsPath, 'utf-8'))
    } catch {
        return []
    }
}

export async function createProject(data: any) {
    const projects = await getProjects()
    const newProject = {
        id: Math.random().toString(36).substring(2, 12),
        name: data.name,
        client: data.client,
        status: 'Briefing', // Briefing, Koncept, Poprawki, Finał
        progress: 10,
        createdAt: new Date().toISOString(),
        updates: []
    }
    projects.push(newProject)
    fs.writeFileSync(path.join(process.cwd(), 'projects.json'), JSON.stringify(projects, null, 2))
    return newProject
}

export async function updateProjectStatus(id: string, status: string, progress: number) {
    const projects = await getProjects()
    const index = projects.findIndex((p: any) => p.id === id)
    if (index > -1) {
        projects[index].status = status
        projects[index].progress = progress
        fs.writeFileSync(path.join(process.cwd(), 'projects.json'), JSON.stringify(projects, null, 2))
    }
}

export async function deleteProject(id: string) {
    const projects = await getProjects()
    const updated = projects.filter((p: any) => p.id !== id)
    fs.writeFileSync(path.join(process.cwd(), 'projects.json'), JSON.stringify(updated, null, 2))
    return true
}

import { Category } from './category.model';

import { Tag } from './tag.model';
export class Pet {
id: number;
category: Category;
name: string;
photoUrls: any[];
tags: Tag[];
status: string;
}
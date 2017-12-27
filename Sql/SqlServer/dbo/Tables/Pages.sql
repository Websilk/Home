CREATE TABLE [dbo].[Pages] (
    [pageId]             INT            NOT NULL,
    [ownerId]            INT            NOT NULL,
    [websiteId]          INT            NOT NULL,
    [parentId]           INT            NOT NULL DEFAULT 0,
    [favorite]           BIT            NOT NULL DEFAULT 0,
    [security]           BIT            NOT NULL DEFAULT 0,
    [enabled]            BIT            NOT NULL DEFAULT 1,
    [deleted]            BIT            NOT NULL DEFAULT 0,
    [dateCreated]        DATETIME       NOT NULL DEFAULT GETDATE(),
    [datemodified]       DATETIME       NOT NULL DEFAULT GETDATE(),
    [title]              NVARCHAR (250) NOT NULL DEFAULT '',

	/*title used in web page <head><title></title></head> */

    [description]        NVARCHAR (160) NOT NULL DEFAULT '',
    [path]               NVARCHAR (512) NOT NULL DEFAULT '',
    [pathIds]            NVARCHAR (100) NOT NULL DEFAULT '',
    [pathlvl] INT NOT NULL DEFAULT 0, 
    CONSTRAINT [PK_Pages] PRIMARY KEY ([pageId])
);


GO

CREATE INDEX [index_pages] ON [dbo].[Pages] (websiteId, pageId)
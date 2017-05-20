CREATE PROCEDURE [dbo].[Block_Create]
	@websiteId int,
	@area nvarchar(16) = '',
	@name nvarchar(32) = ''

AS
DECLARE @id int
SET @id = NEXT VALUE FOR SequenceBlock
INSERT INTO Blocks (blockId, websiteId, area, name)
VALUES(@id, @websiteId, @area, @name)

SELECT @id
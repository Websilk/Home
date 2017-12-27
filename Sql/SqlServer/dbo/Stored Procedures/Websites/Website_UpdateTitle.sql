-- =============================================
-- Author:		Mark Entingh
-- Create date: 4/13/2014 1:40 pm
-- Description:	rename the title of a website
-- =============================================
CREATE PROCEDURE [dbo].[Website_UpdateTitle]
	@websiteId int = 0, 
	@ownerId int = 0,
	@newName nvarchar(50) = ''
AS
BEGIN
	SET NOCOUNT ON;
	UPDATE Websites SET title=@newName WHERE websiteId=@websiteId AND ownerId=@ownerId
END

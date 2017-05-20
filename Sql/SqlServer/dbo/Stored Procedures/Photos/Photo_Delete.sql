-- =============================================
-- Author:		Mark Entingh
-- Create date: 7/24/2015 12:30 PM
-- Description:	delete photo after removing from disk
-- =============================================
CREATE PROCEDURE [dbo].[Photo_Delete] 
	@websiteId int = 0,
	@filename nvarchar(25) = ''
AS
BEGIN
	SET NOCOUNT ON;
	DELETE FROM Photos WHERE websiteId=@websiteId AND [filename]=@filename
END